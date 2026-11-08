import { and, asc, count, desc, eq, ilike, inArray, or, type SQL } from "drizzle-orm";
import { db } from "../db/client.ts";
import { manufacturers, materials, plants } from "../db/schema.ts";
import type { ListMaterialsInput, SortColumn } from "./schemas.ts";

const sortableColumns = {
  materialNumber: materials.materialNumber,
  description: materials.description,
  quantityOnHand: materials.quantityOnHand,
  unitPrice: materials.unitPrice,
  updatedAt: materials.updatedAt,
} satisfies Record<SortColumn, unknown>;

// Treat the user's text literally: escape LIKE wildcards so "%" or "_" don't match everything.
const escapeLike = (text: string) => text.replace(/[\\%_]/g, (c) => `\\${c}`);

function buildWhere(input: ListMaterialsInput): SQL | undefined {
  const conditions: (SQL | undefined)[] = [];

  // Every word must match at least one of the three searchable fields.
  for (const word of input.q.split(/\s+/).filter(Boolean)) {
    const pattern = `%${escapeLike(word)}%`;
    conditions.push(
      or(
        ilike(materials.materialNumber, pattern),
        ilike(materials.description, pattern),
        ilike(materials.mpn, pattern),
      ),
    );
  }

  if (input.status.length) conditions.push(inArray(materials.status, input.status));
  if (input.type.length) conditions.push(inArray(materials.type, input.type));
  if (input.plant) conditions.push(eq(materials.plantCode, input.plant));
  if (input.manufacturer) conditions.push(eq(materials.manufacturerId, input.manufacturer));

  return and(...conditions);
}

export async function listMaterials(input: ListMaterialsInput) {
  const where = buildWhere(input);
  const sort = input.sort ?? { column: "materialNumber", direction: "asc" };
  const direction = sort.direction === "asc" ? asc : desc;

  const [rows, [totals]] = await Promise.all([
    db
      .select({
        id: materials.id,
        materialNumber: materials.materialNumber,
        description: materials.description,
        type: materials.type,
        status: materials.status,
        mpn: materials.mpn,
        unitOfMeasure: materials.unitOfMeasure,
        unitPrice: materials.unitPrice,
        quantityOnHand: materials.quantityOnHand,
        updatedAt: materials.updatedAt,
        manufacturer: manufacturers.name,
        plantCode: plants.code,
        plantName: plants.name,
      })
      .from(materials)
      .innerJoin(manufacturers, eq(materials.manufacturerId, manufacturers.id))
      .innerJoin(plants, eq(materials.plantCode, plants.code))
      .where(where)
      // id as the final tie-breaker keeps the order stable between pages.
      .orderBy(direction(sortableColumns[sort.column]), asc(materials.id))
      .limit(input.pageSize)
      .offset((input.page - 1) * input.pageSize),
    db.select({ total: count() }).from(materials).where(where),
  ]);

  return { rows, total: totals?.total ?? 0, page: input.page, pageSize: input.pageSize };
}

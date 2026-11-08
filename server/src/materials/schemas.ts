import { z } from "zod";

// Shared with the web app, so this file must only import zod (no database code).
export const materialTypes = ["spare_part", "consumable", "raw_material", "tool"] as const;
export const materialStatuses = ["active", "obsolete", "pending_review"] as const;

export const sortColumns = [
  "materialNumber",
  "description",
  "quantityOnHand",
  "unitPrice",
  "updatedAt",
] as const;
export type SortColumn = (typeof sortColumns)[number];

export const pageSizes = [25, 50, 100] as const;

// The complete table state. The API validates it, and the web app parses the URL with it.
export const listMaterialsInput = z.object({
  q: z.string().trim().max(100).default(""),
  status: z.array(z.enum(materialStatuses)).default([]),
  type: z.array(z.enum(materialTypes)).default([]),
  plant: z.string().trim().min(1).max(10).optional(),
  manufacturer: z.number().int().positive().optional(),
  // No sort means the default: Material Number ascending.
  sort: z
    .object({ column: z.enum(sortColumns), direction: z.enum(["asc", "desc"]) })
    .optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.union(pageSizes.map((n) => z.literal(n))).default(25),
});

export type ListMaterialsInput = z.infer<typeof listMaterialsInput>;

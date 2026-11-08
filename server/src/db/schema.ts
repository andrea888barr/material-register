import {
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { materialStatuses, materialTypes } from "../materials/schemas.ts";

export const materialType = pgEnum("material_type", materialTypes);
export const materialStatus = pgEnum("material_status", materialStatuses);

export const plants = pgTable("plants", {
  // SAP plant code, e.g. "1000". Text because codes can have letters or leading zeros.
  code: text("code").primaryKey(),
  name: text("name").notNull(),
});

export const manufacturers = pgTable("manufacturers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull().unique(),
});

export const materials = pgTable(
  "materials",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    materialNumber: text("material_number").notNull().unique(),
    description: text("description").notNull(),
    type: materialType("type").notNull(),
    status: materialStatus("status").notNull(),
    manufacturerId: integer("manufacturer_id")
      .notNull()
      .references(() => manufacturers.id, { onDelete: "restrict" }),
    mpn: text("mpn").notNull(),
    plantCode: text("plant_code")
      .notNull()
      .references(() => plants.code, { onUpdate: "cascade", onDelete: "restrict" }),
    unitOfMeasure: text("unit_of_measure").notNull(),
    unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(), // AUD
    quantityOnHand: integer("quantity_on_hand").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // Postgres doesn't index foreign keys automatically; the Plant and Manufacturer filters use these.
    index("materials_plant_code_idx").on(t.plantCode),
    index("materials_manufacturer_id_idx").on(t.manufacturerId),
  ],
);

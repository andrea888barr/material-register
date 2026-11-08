CREATE TYPE "public"."material_status" AS ENUM('active', 'obsolete', 'pending_review');--> statement-breakpoint
CREATE TYPE "public"."material_type" AS ENUM('spare_part', 'consumable', 'raw_material', 'tool');--> statement-breakpoint
CREATE TABLE "manufacturers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "manufacturers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	CONSTRAINT "manufacturers_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "materials" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "materials_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"material_number" text NOT NULL,
	"description" text NOT NULL,
	"type" "material_type" NOT NULL,
	"status" "material_status" NOT NULL,
	"manufacturer_id" integer NOT NULL,
	"mpn" text NOT NULL,
	"plant_code" text NOT NULL,
	"unit_of_measure" text NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"quantity_on_hand" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "materials_material_number_unique" UNIQUE("material_number")
);
--> statement-breakpoint
CREATE TABLE "plants" (
	"code" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "materials" ADD CONSTRAINT "materials_manufacturer_id_manufacturers_id_fk" FOREIGN KEY ("manufacturer_id") REFERENCES "public"."manufacturers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "materials" ADD CONSTRAINT "materials_plant_code_plants_code_fk" FOREIGN KEY ("plant_code") REFERENCES "public"."plants"("code") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "materials_plant_code_idx" ON "materials" USING btree ("plant_code");--> statement-breakpoint
CREATE INDEX "materials_manufacturer_id_idx" ON "materials" USING btree ("manufacturer_id");
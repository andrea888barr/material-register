import { initTRPC } from "@trpc/server";
import { asc } from "drizzle-orm";
import { db } from "./db/client.ts";
import { manufacturers, plants } from "./db/schema.ts";
import { listMaterials } from "./materials/listMaterials.ts";
import { listMaterialsInput } from "./materials/schemas.ts";

const t = initTRPC.create();

export const appRouter = t.router({
  materials: t.router({
    list: t.procedure.input(listMaterialsInput).query(({ input }) => listMaterials(input)),
  }),
  // Options for the Plant and Manufacturer filter dropdowns.
  plants: t.procedure.query(() => db.select().from(plants).orderBy(asc(plants.code))),
  manufacturers: t.procedure.query(() =>
    db.select().from(manufacturers).orderBy(asc(manufacturers.name)),
  ),
});

export type AppRouter = typeof appRouter;

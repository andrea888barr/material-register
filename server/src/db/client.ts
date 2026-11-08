import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../env.ts";
import * as schema from "./schema.ts";

export const sql = postgres(env.databaseUrl);
export const db = drizzle(sql, { schema });

import { fileURLToPath } from "node:url";

// Load the repo-root .env (if present) so every server script shares one config file.
try {
  process.loadEnvFile(fileURLToPath(new URL("../../.env", import.meta.url)));
} catch {
  // No .env file: rely on variables already set in the environment.
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is not set. Copy .env.example to .env.");

export const env = {
  databaseUrl,
  port: Number(process.env.PORT ?? 3001),
};

import nextEnv from "@next/env";
import { migrate } from "drizzle-orm/postgres-js/migrator";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

async function run() {
  const { db, sql } = await import("./client");
  await migrate(db, { migrationsFolder: "drizzle" });
  await sql.end();
}

run().catch((error) => {
  console.error("Database migration failed", error);
  process.exitCode = 1;
});

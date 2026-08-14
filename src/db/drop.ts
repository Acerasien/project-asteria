import nextEnv from "@next/env";
import postgres from "postgres";

const loadEnvConfig = nextEnv.loadEnvConfig || (nextEnv as any).default?.loadEnvConfig;
loadEnvConfig(process.cwd());

const sql = postgres(process.env.DATABASE_URL!);

async function drop() {
  await sql`DROP SCHEMA public CASCADE;`;
  await sql`CREATE SCHEMA public;`;
  console.log("Dropped schema public");
  process.exit(0);
}

drop();

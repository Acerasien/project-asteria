import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const globalForDb = globalThis as unknown as { hotelSql?: ReturnType<typeof postgres> };
const sql = globalForDb.hotelSql ?? postgres(databaseUrl, { max: 10, prepare: false });

if (process.env.NODE_ENV !== "production") {
  globalForDb.hotelSql = sql;
}

export const db = drizzle(sql, { schema });
export { sql };

import nextEnv from "@next/env";
import { hash } from "bcryptjs";
import { sql } from "drizzle-orm";

const loadEnvConfig = nextEnv.loadEnvConfig || (nextEnv as any).default?.loadEnvConfig;
loadEnvConfig(process.cwd());
loadEnvConfig(process.cwd());

if (process.env.NODE_ENV === "production") {
  throw new Error("Development seed data cannot run in production");
}

const administrator = {
  name: "Admin User",
  email: "admin@hotel.local",
  role: "ADMIN" as const,
  password: "admin123",
};

async function run() {
  const { db, sql: connection } = await import("./client");
  const { guests, reservations, beds, rooms, users, locations } = await import("./schema");
  const passwordHash = await hash(administrator.password, 12);

  await db.transaction(async (tx) => {
    await tx.execute(sql`TRUNCATE TABLE ${reservations}, ${guests}, ${beds}, ${rooms}, ${locations}, ${users} CASCADE`);
    await tx.execute(sql`SELECT setval('reservation_booking_number_seq', 1, false)`);
    await tx.insert(users).values({
      name: administrator.name,
      email: administrator.email,
      role: administrator.role,
      passwordHash,
    });
  });

  await connection.end();
  console.log("Seeded a clean database with one administrator account.");
}

run().catch((error) => {
  console.error("Database seed failed", error);
  process.exitCode = 1;
});

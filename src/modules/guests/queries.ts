import { and, asc, count, desc, eq, ilike, max, ne, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db/client";
import { guests, reservations, beds, type Guest } from "@/db/schema";
import { verifySession } from "@/lib/dal";
import type { GuestInput } from "./validation";

const PAGE_SIZE = 25;
export type GuestFilters = { query?: string; page?: string; imported?: string };

function searchCondition(query: string) {
  if (!query) return undefined;
  const pattern = `%${query}%`;
  return or(ilike(guests.fullName, pattern), ilike(guests.email, pattern), ilike(guests.phone, pattern), ilike(guests.idNumber, pattern));
}

export async function getGuests(filters: GuestFilters) {
  await verifySession("guests:manage");
  const query = filters.query?.trim().slice(0, 100) ?? "";
  const requestedPage = Number.parseInt(filters.page ?? "1", 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const where = searchCondition(query);

  const [totalResult, rows] = await Promise.all([
    db.select({ value: count() }).from(guests).where(where),
    db
      .select({
        id: guests.id,
        fullName: guests.fullName,
        phone: guests.phone,
        email: guests.email,
        idNumber: guests.idNumber,
        totalStays: count(reservations.id),
        lastStayDate: max(reservations.checkOutDate),
      })
      .from(guests)
      .leftJoin(reservations, eq(guests.id, reservations.guestId))
      .where(where)
      .groupBy(guests.id)
      .orderBy(asc(guests.fullName))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
  ]);

  const total = totalResult[0]?.value ?? 0;
  return { rows, total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)), query };
}

export async function getGuestProfile(id: string) {
  await verifySession("guests:manage");
  const [guest] = await db.select().from(guests).where(eq(guests.id, id)).limit(1);
  if (!guest) return undefined;

  const history = await db
    .select({
      id: reservations.id,
      bookingCode: reservations.bookingCode,
      roomNumber: beds.bedNumber, // keep var name roomNumber
      checkInDate: reservations.checkInDate,
      checkOutDate: reservations.checkOutDate,
      status: reservations.status,
    })
    .from(reservations)
    .innerJoin(beds, eq(reservations.bedId, beds.id))
    .where(eq(reservations.guestId, id))
    .orderBy(desc(reservations.checkInDate), desc(reservations.createdAt));

  return { guest, history };
}

export async function findDuplicateGuest(input: Pick<GuestInput, "fullName" | "phone" | "idNumber">, excludeId?: string) {
  const conditions: SQL[] = [
    or(
      sql`lower(${guests.idNumber}) = lower(${input.idNumber})`,
      and(sql`lower(${guests.fullName}) = lower(${input.fullName})`, eq(guests.phone, input.phone)),
    )!,
  ];
  if (excludeId) conditions.push(ne(guests.id, excludeId));
  const [row] = await db.select({ id: guests.id, fullName: guests.fullName, idNumber: guests.idNumber, phone: guests.phone }).from(guests).where(and(...conditions)).limit(1);
  return row;
}

export function guestDefaults(guest: Guest) {
  return { fullName: guest.fullName, gender: guest.gender, phone: guest.phone, email: guest.email, idNumber: guest.idNumber, notes: guest.notes };
}

export async function getRecentGuests(limit = 10) {
  await verifySession("reservations:manage");
  return db
    .select({
      id: guests.id,
      name: guests.fullName,
      phone: guests.phone,
      gender: guests.gender,
      idNumber: guests.idNumber,
    })
    .from(guests)
    .orderBy(desc(guests.createdAt))
    .limit(limit);
}

export async function searchGuests(query: string, limit = 10) {
  await verifySession("reservations:manage");
  const trimmed = query.trim().slice(0, 100);
  if (!trimmed) {
    return getRecentGuests(limit);
  }
  const pattern = `%${trimmed}%`;
  return db
    .select({
      id: guests.id,
      name: guests.fullName,
      phone: guests.phone,
      gender: guests.gender,
      idNumber: guests.idNumber,
    })
    .from(guests)
    .where(
      or(
        ilike(guests.fullName, pattern),
        ilike(guests.phone, pattern),
        ilike(guests.idNumber, pattern),
      ),
    )
    .orderBy(asc(guests.fullName))
    .limit(limit);
}

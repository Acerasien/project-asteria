import { and, asc, count, desc, eq, gt, ilike, inArray, lt, ne, or, type SQL } from "drizzle-orm";
import { db } from "@/db/client";
import { guests, reservations, beds, rooms, users, locations, type ReservationStatus } from "@/db/schema";
import { verifySession } from "@/lib/dal";

const PAGE_SIZE = 25;
const validStatuses = new Set<ReservationStatus>(["CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "CANCELLED"]);

export type ReservationFilters = { query?: string; status?: string; page?: string };

export async function getReservations(filters: ReservationFilters) {
  await verifySession("reservations:manage");
  const query = filters.query?.trim().slice(0, 100) ?? "";
  const status = validStatuses.has(filters.status as ReservationStatus) ? (filters.status as ReservationStatus) : undefined;
  const requestedPage = Number.parseInt(filters.page ?? "1", 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const conditions: SQL[] = [];

  if (query) {
    const pattern = `%${query}%`;
    conditions.push(or(ilike(reservations.bookingCode, pattern), ilike(guests.fullName, pattern), ilike(beds.bedNumber, pattern))!);
  }
  if (status) conditions.push(eq(reservations.status, status));
  const where = conditions.length ? and(...conditions) : undefined;

  const [totalResult, rows] = await Promise.all([
    db.select({ value: count() }).from(reservations).innerJoin(guests, eq(reservations.guestId, guests.id)).innerJoin(beds, eq(reservations.bedId, beds.id)).where(where),
    db
      .select({
        id: reservations.id,
        bookingCode: reservations.bookingCode,
        guestName: guests.fullName,
        roomNumber: beds.bedNumber, // keep key as roomNumber for UI compatibility
        checkInDate: reservations.checkInDate,
        checkOutDate: reservations.checkOutDate,
        status: reservations.status,
      })
      .from(reservations)
      .innerJoin(guests, eq(reservations.guestId, guests.id))
      .innerJoin(beds, eq(reservations.bedId, beds.id))
      .where(where)
      .orderBy(desc(reservations.checkInDate), desc(reservations.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
  ]);

  const total = totalResult[0]?.value ?? 0;
  return { rows, total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)), query, status };
}

import { getRecentGuests } from "../guests/queries";

export async function getReservationOptions(initialGuestId?: string) {
  await verifySession("reservations:manage");
  const [recentGuests, roomOptions, bookingOptions] = await Promise.all([
    getRecentGuests(10),
    db
      .select({
        id: beds.id,
        roomId: beds.roomId,
        number: beds.bedNumber,
        floor: locations.name,
        status: beds.status,
        type: rooms.name,
        isMixedGender: rooms.isMixedGender,
      })
      .from(beds)
      .innerJoin(rooms, eq(beds.roomId, rooms.id))
      .leftJoin(locations, eq(rooms.locationId, locations.id))
      .orderBy(asc(locations.name), asc(beds.bedNumber)),
    db
      .select({
        id: reservations.id,
        bedId: reservations.bedId,
        roomId: beds.roomId,
        guestGender: guests.gender,
        checkInDate: reservations.checkInDate,
        checkOutDate: reservations.checkOutDate,
      })
      .from(reservations)
      .innerJoin(beds, eq(reservations.bedId, beds.id))
      .innerJoin(guests, eq(reservations.guestId, guests.id))
      .where(inArray(reservations.status, ["CONFIRMED", "CHECKED_IN"])),
  ]);

  const guestOptions = [...recentGuests];
  if (initialGuestId && !guestOptions.some((g) => g.id === initialGuestId)) {
    const [initialGuest] = await db
      .select({
        id: guests.id,
        name: guests.fullName,
        phone: guests.phone,
        gender: guests.gender,
        idNumber: guests.idNumber,
      })
      .from(guests)
      .where(eq(guests.id, initialGuestId))
      .limit(1);
    if (initialGuest) {
      guestOptions.unshift(initialGuest);
    }
  }

  return { guests: guestOptions, rooms: roomOptions, bookings: bookingOptions };
}

export async function getReservation(id: string) {
  await verifySession("reservations:manage");
  const [row] = await db
    .select({
      id: reservations.id,
      bookingCode: reservations.bookingCode,
      guestId: reservations.guestId,
      guestName: guests.fullName,
      guestPhone: guests.phone,
      guestEmail: guests.email,
      roomId: reservations.bedId,
      roomNumber: beds.bedNumber,
      roomStatus: beds.status,
      roomType: rooms.name,
      checkInDate: reservations.checkInDate,
      checkOutDate: reservations.checkOutDate,
      status: reservations.status,
      notes: reservations.notes,
      createdAt: reservations.createdAt,
      createdByName: users.name,
    })
    .from(reservations)
    .innerJoin(guests, eq(reservations.guestId, guests.id))
    .innerJoin(beds, eq(reservations.bedId, beds.id))
    .innerJoin(rooms, eq(beds.roomId, rooms.id))
    .innerJoin(users, eq(reservations.createdBy, users.id))
    .where(eq(reservations.id, id))
    .limit(1);
  return row;
}

export async function findOverlappingReservation(bedId: string, checkInDate: string, checkOutDate: string, excludeId?: string) {
  const conditions: SQL[] = [
    eq(reservations.bedId, bedId),
    inArray(reservations.status, ["CONFIRMED", "CHECKED_IN"]),
    lt(reservations.checkInDate, checkOutDate),
    gt(reservations.checkOutDate, checkInDate),
  ];
  if (excludeId) conditions.push(ne(reservations.id, excludeId));
  const [row] = await db.select({ bookingCode: reservations.bookingCode }).from(reservations).where(and(...conditions)).limit(1);
  return row;
}

// Check if there are any conflicting genders in the same ROOM (not just bed) during the requested dates
export async function findConflictingGenderReservation(roomId: string, guestGender: "MALE" | "FEMALE", checkInDate: string, checkOutDate: string, excludeId?: string) {
  // If the room allows mixed gender, no conflict check is needed
  const [room] = await db.select({ isMixedGender: rooms.isMixedGender }).from(rooms).where(eq(rooms.id, roomId)).limit(1);
  if (room?.isMixedGender) {
    return null;
  }

  const conditions: SQL[] = [
    eq(beds.roomId, roomId),
    ne(guests.gender, guestGender),
    inArray(reservations.status, ["CONFIRMED", "CHECKED_IN"]),
    lt(reservations.checkInDate, checkOutDate),
    gt(reservations.checkOutDate, checkInDate),
  ];
  if (excludeId) conditions.push(ne(reservations.id, excludeId));
  const [row] = await db
    .select({ bookingCode: reservations.bookingCode, gender: guests.gender })
    .from(reservations)
    .innerJoin(beds, eq(reservations.bedId, beds.id))
    .innerJoin(guests, eq(reservations.guestId, guests.id))
    .where(and(...conditions))
    .limit(1);
  return row;
}

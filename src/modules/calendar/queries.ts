import { and, asc, eq, exists, gt, inArray, lt, or, type SQL } from "drizzle-orm";
import { db } from "@/db/client";
import { guests, reservations, beds, rooms, locations } from "@/db/schema";
import { verifySession } from "@/lib/dal";
import type { CalendarSearchParams } from "./date-window";
import { parseCalendarParams } from "./date-window";

export async function getCalendarData(searchParams: CalendarSearchParams) {
  await verifySession("calendar:view");
  const window = parseCalendarParams(searchParams);
  const roomConditions: SQL[] = [];
  if (window.location) roomConditions.push(eq(locations.name, window.location));
  if (window.status) roomConditions.push(eq(beds.status, window.status));

  const activeOrBookedCondition = or(
    eq(beds.isActive, true),
    exists(
      db
        .select()
        .from(reservations)
        .where(
          and(
            eq(reservations.bedId, beds.id),
            inArray(reservations.status, ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"]),
            lt(reservations.checkInDate, window.endExclusive),
            gt(reservations.checkOutDate, window.start),
          ),
        ),
    ),
  );
  roomConditions.push(activeOrBookedCondition!);

  const roomRows = await db
    .select({ id: beds.id, number: beds.bedNumber, location: locations.name, status: beds.status, type: rooms.name })
    .from(beds)
    .innerJoin(rooms, eq(beds.roomId, rooms.id))
    .leftJoin(locations, eq(rooms.locationId, locations.id))
    .where(roomConditions.length ? and(...roomConditions) : undefined)
    .orderBy(asc(locations.name), asc(rooms.name), asc(beds.bedNumber));

  const bedIds = roomRows.map((bed) => bed.id);
  const reservationRows = bedIds.length
    ? await db
        .select({
          id: reservations.id,
          bookingCode: reservations.bookingCode,
          roomId: reservations.bedId, // keep key roomId for UI compatibility for now
          guestName: guests.fullName,
          checkInDate: reservations.checkInDate,
          checkOutDate: reservations.checkOutDate,
          status: reservations.status,
        })
        .from(reservations)
        .innerJoin(guests, eq(reservations.guestId, guests.id))
        .where(
          and(
            inArray(reservations.bedId, bedIds),
            inArray(reservations.status, ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"]),
            lt(reservations.checkInDate, window.endExclusive),
            gt(reservations.checkOutDate, window.start),
          ),
        )
        .orderBy(asc(reservations.checkInDate))
    : [];

  const locationList = await db.select({ location: locations.name }).from(locations).orderBy(asc(locations.name));
  return { ...window, rooms: roomRows, reservations: reservationRows, locations: locationList.map((row) => row.location) };
}

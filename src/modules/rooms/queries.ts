import { and, asc, eq, gt, inArray, lte } from "drizzle-orm";
import { db } from "@/db/client";
import { beds, rooms, locations, reservations, guests } from "@/db/schema";
import { verifySession } from "@/lib/dal";

export async function getRoomsStatusData(date: string) {
  await verifySession("calendar:view");

  const rows = await db
    .select({
      bedId: beds.id,
      bedNumber: beds.bedNumber,
      bedStatus: beds.status,
      roomId: rooms.id,
      roomName: rooms.name,
      locationName: locations.name,
      isMixedGender: rooms.isMixedGender,
      reservationId: reservations.id,
      bookingCode: reservations.bookingCode,
      reservationStatus: reservations.status,
      guestId: guests.id,
      guestName: guests.fullName,
      checkInDate: reservations.checkInDate,
      checkOutDate: reservations.checkOutDate,
    })
    .from(beds)
    .innerJoin(rooms, eq(beds.roomId, rooms.id))
    .leftJoin(locations, eq(rooms.locationId, locations.id))
    .leftJoin(
      reservations,
      and(
        eq(reservations.bedId, beds.id),
        inArray(reservations.status, ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"]),
        lte(reservations.checkInDate, date),
        gt(reservations.checkOutDate, date)
      )
    )
    .leftJoin(guests, eq(reservations.guestId, guests.id))
    .orderBy(asc(locations.name), asc(rooms.name), asc(beds.bedNumber));

  return rows;
}

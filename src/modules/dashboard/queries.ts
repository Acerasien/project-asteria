import { and, asc, count, eq, gte, inArray, lte } from "drizzle-orm";
import { db } from "@/db/client";
import { guests, reservations, beds, rooms, locations } from "@/db/schema";
import { verifySession } from "@/lib/dal";
import { hotelDate } from "@/lib/hotel-date";

export async function getDashboardData() {
  await verifySession("dashboard:view");
  const today = hotelDate();
  const tomorrow = hotelDate(1);

  const [arrivalsResult, departuresResult, occupiedResult, totalRoomsResult, dirtyResult, arrivals, departures, attention] =
    await Promise.all([
      db.select({ value: count() }).from(reservations).where(and(eq(reservations.checkInDate, today), eq(reservations.status, "CONFIRMED"))),
      db.select({ value: count() }).from(reservations).where(and(eq(reservations.checkOutDate, today), eq(reservations.status, "CHECKED_IN"))),
      db.select({ value: count() }).from(reservations).where(eq(reservations.status, "CHECKED_IN")),
      db.select({ value: count() }).from(beds),
      db.select({ value: count() }).from(beds).where(eq(beds.status, "DIRTY")),
      db
        .select({
          id: reservations.id,
          bookingCode: reservations.bookingCode,
          guestName: guests.fullName,
          roomNumber: beds.bedNumber, // UI still expects roomNumber but data is bedNumber
          checkInDate: reservations.checkInDate,
          status: reservations.status,
        })
        .from(reservations)
        .innerJoin(guests, eq(reservations.guestId, guests.id))
        .innerJoin(beds, eq(reservations.bedId, beds.id))
        .where(
          and(
            gte(reservations.checkInDate, today),
            lte(reservations.checkInDate, tomorrow),
            eq(reservations.status, "CONFIRMED"),
          ),
        )
        .orderBy(asc(reservations.checkInDate), asc(beds.bedNumber))
        .limit(10),
      db
        .select({
          id: reservations.id,
          bookingCode: reservations.bookingCode,
          guestName: guests.fullName,
          roomNumber: beds.bedNumber,
          checkOutDate: reservations.checkOutDate,
          status: reservations.status,
        })
        .from(reservations)
        .innerJoin(guests, eq(reservations.guestId, guests.id))
        .innerJoin(beds, eq(reservations.bedId, beds.id))
        .where(
          and(
            eq(reservations.checkOutDate, today),
            inArray(reservations.status, ["CHECKED_IN", "CHECKED_OUT"]),
          ),
        )
        .orderBy(asc(beds.bedNumber))
        .limit(10),
      db
        .select({ id: beds.id, roomNumber: beds.bedNumber, floor: locations.name, status: beds.status }) // Keep 'floor' prop name for now
        .from(beds)
        .leftJoin(rooms, eq(beds.roomId, rooms.id))
        .leftJoin(locations, eq(rooms.locationId, locations.id))
        .where(inArray(beds.status, ["DIRTY", "MAINTENANCE", "OUT_OF_ORDER"]))
        .orderBy(asc(locations.name), asc(beds.bedNumber)),
    ]);

  const totalRooms = totalRoomsResult[0]?.value ?? 0;
  const occupiedRooms = occupiedResult[0]?.value ?? 0;

  return {
    summary: {
      arrivals: arrivalsResult[0]?.value ?? 0,
      departures: departuresResult[0]?.value ?? 0,
      occupiedRooms,
      totalRooms,
      dirtyRooms: dirtyResult[0]?.value ?? 0,
      occupancy: totalRooms ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
    },
    arrivals,
    departures,
    attention,
  };
}

import { and, asc, count, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { guests, reservations, beds, rooms, locations, type RoomStatus } from "@/db/schema";
import { verifySession } from "@/lib/dal";

const validStatuses = new Set<RoomStatus>(["CLEAN", "DIRTY", "MAINTENANCE", "OUT_OF_ORDER"]);
export type HousekeepingFilters = { status?: string | string[] };

export async function getHousekeepingBoard(filters: HousekeepingFilters) {
  await verifySession("housekeeping:view");
  const requested = Array.isArray(filters.status) ? filters.status[0] : filters.status;
  const status = validStatuses.has(requested as RoomStatus) ? (requested as RoomStatus) : undefined;

  const [roomRows, countRows] = await Promise.all([
    db
      .select({
        id: beds.id,
        roomNumber: beds.bedNumber,
        floor: locations.name,
        status: beds.status,
        roomType: rooms.name,
        reservationId: reservations.id,
        bookingCode: reservations.bookingCode,
        guestName: guests.fullName,
      })
      .from(beds)
      .innerJoin(rooms, eq(beds.roomId, rooms.id))
      .leftJoin(locations, eq(rooms.locationId, locations.id))
      .leftJoin(reservations, and(eq(reservations.bedId, beds.id), eq(reservations.status, "CHECKED_IN")))
      .leftJoin(guests, eq(reservations.guestId, guests.id))
      .where(status ? eq(beds.status, status) : undefined)
      .orderBy(asc(locations.name), asc(beds.bedNumber)),
    db.select({ status: beds.status, value: count() }).from(beds).groupBy(beds.status),
  ]);

  const counts: Record<RoomStatus, number> = { CLEAN: 0, DIRTY: 0, MAINTENANCE: 0, OUT_OF_ORDER: 0 };
  for (const row of countRows) counts[row.status] = row.value;
  return { rooms: roomRows, counts, total: Object.values(counts).reduce((sum, value) => sum + value, 0), status };
}

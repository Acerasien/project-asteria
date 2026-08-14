import { asc, count, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { reservations, beds, rooms, users, locations } from "@/db/schema";
import { verifySession } from "@/lib/dal";

export type SettingsTab = "room-types" | "rooms" | "staff" | "locations";

export function parseSettingsTab(value: string | string[] | undefined): SettingsTab {
  const tab = Array.isArray(value) ? value[0] : value;
  return tab === "rooms" || tab === "staff" || tab === "locations" ? tab : "room-types";
}

export async function getRoomTypeSettings() {
  await verifySession("rooms:manage");
  return db
    .select({ id: rooms.id, name: rooms.name, locationName: locations.name, isMixedGender: rooms.isMixedGender, description: rooms.description, roomCount: count(beds.id) })
    .from(rooms)
    .leftJoin(locations, eq(rooms.locationId, locations.id))
    .leftJoin(beds, eq(rooms.id, beds.roomId))
    .groupBy(rooms.id, locations.name, rooms.isMixedGender)
    .orderBy(asc(rooms.name));
}

export async function getRoomSettings() {
  await verifySession("rooms:manage");
  return db
    .select({ id: beds.id, bedNumber: beds.bedNumber, status: beds.status, roomName: rooms.name, reservationCount: count(reservations.id) })
    .from(beds)
    .innerJoin(rooms, eq(beds.roomId, rooms.id))
    .leftJoin(reservations, eq(beds.id, reservations.bedId))
    .groupBy(beds.id, rooms.name)
    .orderBy(asc(rooms.name), asc(beds.bedNumber));
}

export async function getStaffSettings() {
  await verifySession("staff:manage");
  return db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role, createdAt: users.createdAt, reservationCount: count(reservations.id) })
    .from(users)
    .leftJoin(reservations, eq(users.id, reservations.createdBy))
    .groupBy(users.id)
    .orderBy(asc(users.name));
}

export async function getRoomTypeForEdit(id: string) {
  await verifySession("rooms:manage");
  const [[row], locationList] = await Promise.all([
    db.select().from(rooms).where(eq(rooms.id, id)).limit(1),
    db.select({ id: locations.id, name: locations.name }).from(locations).orderBy(asc(locations.name)),
  ]);
  return { roomType: row, locations: locationList };
}

export async function getRoomForEdit(id: string) {
  await verifySession("rooms:manage");
  const [[bed], roomList] = await Promise.all([
    db.select().from(beds).where(eq(beds.id, id)).limit(1),
    db.select({ id: rooms.id, name: rooms.name }).from(rooms).orderBy(asc(rooms.name)),
  ]);
  return { room: bed, roomTypes: roomList };
}

export async function getRoomTypeOptions() {
  await verifySession("rooms:manage");
  return db.select({ id: rooms.id, name: rooms.name }).from(rooms).orderBy(asc(rooms.name));
}

export async function getStaffForEdit(id: string) {
  await verifySession("staff:manage");
  const [row] = await db.select({ id: users.id, name: users.name, email: users.email, role: users.role }).from(users).where(eq(users.id, id)).limit(1);
  return row;
}

export async function getLocationSettings() {
  await verifySession("rooms:manage");
  return db
    .select({ id: locations.id, name: locations.name, description: locations.description, roomTypeCount: count(rooms.id) })
    .from(locations)
    .leftJoin(rooms, eq(locations.id, rooms.locationId))
    .groupBy(locations.id)
    .orderBy(asc(locations.name));
}

export async function getLocationOptions() {
  await verifySession("rooms:manage");
  return db.select({ id: locations.id, name: locations.name }).from(locations).orderBy(asc(locations.name));
}

export async function getLocationForEdit(id: string) {
  await verifySession("rooms:manage");
  const [row] = await db.select().from(locations).where(eq(locations.id, id)).limit(1);
  return row;
}

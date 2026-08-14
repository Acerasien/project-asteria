"use server";

import { hash } from "bcryptjs";
import { and, count, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db/client";
import { reservations, beds, rooms, users, locations } from "@/db/schema";
import { verifySession } from "@/lib/dal";
import { canSetRoomStatus } from "@/modules/housekeeping/status-rules";
import { bulkRoomStatusAllowed, canChangeStaffRole, canDeleteStaff } from "@/modules/settings/safety-rules";
import { roomInputFromForm, roomTypeInputFromForm, staffInputFromForm, locationInputFromForm, roomTypeCreateInputSchema } from "@/modules/settings/validation";

export type SettingsActionState = { status: "idle" | "error" | "success"; message?: string; fieldErrors?: Record<string, string[]> };

const idSchema = z.string().uuid();
const bulkSchema = z.object({ bedIds: z.array(z.string().uuid()).min(1).max(100), status: z.enum(["CLEAN", "DIRTY", "MAINTENANCE", "OUT_OF_ORDER"]) });

function validationState(error: { flatten(): { fieldErrors: Record<string, string[]> } }): SettingsActionState {
  return { status: "error", message: "Periksa detail yang disorot.", fieldErrors: error.flatten().fieldErrors };
}

function uniqueMessage(error: unknown, resource: string) {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
  const resourceLabels: Record<string, string> = {
    "room type": "kamar", // was tipe kamar
    "room": "kasur", // was kamar
    "staff account": "akun staf",
    "location": "lokasi",
  };
  const mapped = resourceLabels[resource] ?? resource;
  return code === "23505" ? `${mapped.charAt(0).toUpperCase() + mapped.slice(1)} dengan detail ini sudah ada.` : `Kami tidak dapat menyimpan ${mapped} ini. Silakan coba lagi.`;
}

function revalidateOperations() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/housekeeping");
  revalidatePath("/dashboard/reservations/new");
  revalidatePath("/dashboard/settings");
}

export async function createRoomTypeAction(_state: SettingsActionState, formData: FormData): Promise<SettingsActionState> {
  await verifySession("rooms:manage");
  const parsed = roomTypeInputFromForm(formData, true); // true for creation mode
  if (!parsed.success) return validationState(parsed.error);
  let id = "";
  try {
    const data = parsed.data as z.infer<typeof roomTypeCreateInputSchema>;
    const { name, locationId, isMixedGender, description, bedCount, bedPrefix } = data;
    await db.transaction(async (tx) => {
      const [created] = await tx.insert(rooms).values({ name, locationId, isMixedGender, description }).returning({ id: rooms.id });
      if (!created) throw new Error("ROOM_CREATION_FAILED");
      id = created.id;

      if (bedCount && bedCount > 0) {
        const prefix = bedPrefix || "Kasur";
        const bedsToInsert = Array.from({ length: bedCount }, (_, i) => ({
          roomId: id,
          bedNumber: `${prefix} ${i + 1}`,
          status: "CLEAN" as const,
        }));
        await tx.insert(beds).values(bedsToInsert);
      }
    });
  } catch (error) { return { status: "error", message: uniqueMessage(error, "room type") }; }
  revalidateOperations();
  redirect(`/dashboard/settings/room-types/${id}?created=1`);
}

export async function updateRoomTypeAction(id: string, _state: SettingsActionState, formData: FormData): Promise<SettingsActionState> {
  await verifySession("rooms:manage");
  if (!idSchema.safeParse(id).success) return { status: "error", message: "Kamar tidak ditemukan." };
  const parsed = roomTypeInputFromForm(formData);
  if (!parsed.success) return validationState(parsed.error);
  try {
    const [updated] = await db.update(rooms).set({ ...parsed.data, updatedAt: new Date() }).where(eq(rooms.id, id)).returning({ id: rooms.id });
    if (!updated) return { status: "error", message: "Kamar tidak ditemukan." };
  } catch (error) { return { status: "error", message: uniqueMessage(error, "room type") }; }
  revalidateOperations();
  redirect(`/dashboard/settings/room-types/${id}?updated=1`);
}

export async function deleteRoomTypeAction(id: string, _state: SettingsActionState, _formData: FormData): Promise<SettingsActionState> {
  void _state;
  void _formData;
  await verifySession("rooms:manage");
  if (!idSchema.safeParse(id).success) return { status: "error", message: "Kamar tidak ditemukan." };
  const outcome = await db.transaction(async (tx) => {
    const [type] = await tx.select({ id: rooms.id, name: rooms.name }).from(rooms).where(eq(rooms.id, id)).for("update").limit(1);
    if (!type) return "Kamar tidak ditemukan.";
    const [usage] = await tx.select({ value: count() }).from(beds).where(eq(beds.roomId, id));
    if ((usage?.value ?? 0) > 0) return `Alihkan atau hapus ${usage!.value} kasur sebelum menghapus kamar ini.`;
    await tx.delete(rooms).where(eq(rooms.id, id));
    return null;
  });
  if (outcome) return { status: "error", message: outcome };
  revalidateOperations();
  redirect("/dashboard/settings?tab=room-types&deleted=1");
}

export async function createLocationAction(_state: SettingsActionState, formData: FormData): Promise<SettingsActionState> {
  await verifySession("rooms:manage");
  const parsed = locationInputFromForm(formData);
  if (!parsed.success) return validationState(parsed.error);
  let id: string;
  try {
    const [created] = await db.insert(locations).values(parsed.data).returning({ id: locations.id });
    if (!created) return { status: "error", message: "Kami tidak dapat membuat lokasi." };
    id = created.id;
  } catch (error) { return { status: "error", message: uniqueMessage(error, "location") }; }
  revalidateOperations();
  redirect(`/dashboard/settings/locations/${id}?created=1`);
}

export async function updateLocationAction(id: string, _state: SettingsActionState, formData: FormData): Promise<SettingsActionState> {
  await verifySession("rooms:manage");
  if (!idSchema.safeParse(id).success) return { status: "error", message: "Lokasi tidak ditemukan." };
  const parsed = locationInputFromForm(formData);
  if (!parsed.success) return validationState(parsed.error);
  try {
    const [updated] = await db.update(locations).set({ ...parsed.data, updatedAt: new Date() }).where(eq(locations.id, id)).returning({ id: locations.id });
    if (!updated) return { status: "error", message: "Lokasi tidak ditemukan." };
  } catch (error) { return { status: "error", message: uniqueMessage(error, "location") }; }
  revalidateOperations();
  redirect(`/dashboard/settings/locations/${id}?updated=1`);
}

export async function deleteLocationAction(id: string, _state: SettingsActionState, _formData: FormData): Promise<SettingsActionState> {
  void _state;
  void _formData;
  await verifySession("rooms:manage");
  if (!idSchema.safeParse(id).success) return { status: "error", message: "Lokasi tidak ditemukan." };
  const outcome = await db.transaction(async (tx) => {
    const [loc] = await tx.select({ id: locations.id, name: locations.name }).from(locations).where(eq(locations.id, id)).for("update").limit(1);
    if (!loc) return "Lokasi tidak ditemukan.";
    const [usage] = await tx.select({ value: count() }).from(rooms).where(eq(rooms.locationId, id));
    if ((usage?.value ?? 0) > 0) return `Alihkan ${usage!.value} kamar sebelum menghapus lokasi ini.`;
    await tx.delete(locations).where(eq(locations.id, id));
    return null;
  });
  if (outcome) return { status: "error", message: outcome };
  revalidateOperations();
  redirect("/dashboard/settings?tab=locations&deleted=1");
}

export async function createRoomAction(_state: SettingsActionState, formData: FormData): Promise<SettingsActionState> {
  await verifySession("rooms:manage");
  console.log("DATABASE_URL inside Next.js:", process.env.DATABASE_URL);
  const parsed = roomInputFromForm(formData); // actually creates a bed now
  console.log("createRoomAction parsed data:", parsed.success ? parsed.data : parsed.error.flatten());
  if (!parsed.success) return validationState(parsed.error);
  let id: string;
  try {
    const { bedNumber, roomId, status, isTemporary, isActive } = parsed.data;
    const [created] = await db.insert(beds).values({ bedNumber, roomId, status, isTemporary, isActive }).returning({ id: beds.id });
    if (!created) return { status: "error", message: "Kami tidak dapat membuat kasur." };
    id = created.id;
  } catch (error) { return { status: "error", message: uniqueMessage(error, "room") }; }
  revalidateOperations();
  redirect(`/dashboard/settings/rooms/${id}?created=1`);
}

export async function updateRoomAction(id: string, _state: SettingsActionState, formData: FormData): Promise<SettingsActionState> {
  await verifySession("rooms:manage");
  if (!idSchema.safeParse(id).success) return { status: "error", message: "Kasur tidak ditemukan." };
  const parsed = roomInputFromForm(formData);
  if (!parsed.success) return validationState(parsed.error);
  try {
    const outcome = await db.transaction(async (tx) => {
      const [bed] = await tx.select({ id: beds.id, isActive: beds.isActive }).from(beds).where(eq(beds.id, id)).for("update").limit(1);
      if (!bed) return "Kasur tidak ditemukan.";
      const [active] = await tx.select({ id: reservations.id }).from(reservations).where(and(eq(reservations.bedId, id), eq(reservations.status, "CHECKED_IN"))).for("update").limit(1);
      if (!canSetRoomStatus(parsed.data.status, Boolean(active))) return "Lakukan check-out tamu saat ini sebelum mengatur status pemeliharaan.";

      if (bed.isActive && !parsed.data.isActive) {
        const [activeBookings] = await tx
          .select({ value: count() })
          .from(reservations)
          .where(
            and(
              eq(reservations.bedId, id),
              inArray(reservations.status, ["CONFIRMED", "CHECKED_IN"])
            )
          );
        if (activeBookings && (activeBookings.value ?? 0) > 0) {
          return `Kasur tidak dapat dinonaktifkan karena memiliki ${activeBookings.value} reservasi aktif atau mendatang. Harap pindahkan reservasi tersebut terlebih dahulu.`;
        }
      }

      const { bedNumber, roomId, status, isTemporary, isActive } = parsed.data;
      await tx.update(beds).set({ bedNumber, roomId, status, isTemporary, isActive, updatedAt: new Date() }).where(eq(beds.id, id));
      return null;
    });
    if (outcome) return { status: "error", message: outcome };
  } catch (error) { return { status: "error", message: uniqueMessage(error, "room") }; }
  revalidateOperations();
  redirect(`/dashboard/settings/rooms/${id}?updated=1`);
}

export async function deleteRoomAction(id: string, _state: SettingsActionState, _formData: FormData): Promise<SettingsActionState> {
  void _state;
  void _formData;
  await verifySession("rooms:manage");
  if (!idSchema.safeParse(id).success) return { status: "error", message: "Kasur tidak ditemukan." };
  const outcome = await db.transaction(async (tx) => {
    const [bed] = await tx.select({ id: beds.id }).from(beds).where(eq(beds.id, id)).for("update").limit(1);
    if (!bed) return "Kasur tidak ditemukan.";
    const [usage] = await tx.select({ value: count() }).from(reservations).where(eq(reservations.bedId, id));
    if ((usage?.value ?? 0) > 0) return "Kasur ini dipertahankan karena memiliki riwayat reservasi.";
    await tx.delete(beds).where(eq(beds.id, id));
    return null;
  });
  if (outcome) return { status: "error", message: outcome };
  revalidateOperations();
  redirect("/dashboard/settings?tab=rooms&deleted=1");
}

export async function bulkUpdateRoomsAction(_state: SettingsActionState, formData: FormData): Promise<SettingsActionState> {
  await verifySession("rooms:manage");
  const parsed = bulkSchema.safeParse({ bedIds: [...new Set(formData.getAll("roomIds").map(String))], status: formData.get("status") });
  if (!parsed.success) return { status: "error", message: "Pilih minimal satu kasur dan status yang valid." };
  const outcome = await db.transaction(async (tx) => {
    const selected = await tx.select({ id: beds.id, bedNumber: beds.bedNumber }).from(beds).where(inArray(beds.id, parsed.data.bedIds)).for("update");
    if (selected.length !== parsed.data.bedIds.length) return "Satu atau beberapa kasur yang dipilih tidak ada lagi.";
    const occupied = await tx
      .select({ bedNumber: beds.bedNumber })
      .from(reservations)
      .innerJoin(beds, eq(reservations.bedId, beds.id))
      .where(and(inArray(reservations.bedId, parsed.data.bedIds), eq(reservations.status, "CHECKED_IN")))
      .for("update");
    const guard = bulkRoomStatusAllowed(parsed.data.status, occupied.map((row) => row.bedNumber));
    if (!guard.allowed) return `${guard.reason} Lakukan check-out tamu sebelum mengatur status pemeliharaan.`;
    await tx.update(beds).set({ status: parsed.data.status, updatedAt: new Date() }).where(inArray(beds.id, parsed.data.bedIds));
    return null;
  });
  if (outcome) return { status: "error", message: outcome };
  revalidateOperations();
  return { status: "success", message: `${parsed.data.bedIds.length} kasur diperbarui.` };
}

export async function createStaffAction(_state: SettingsActionState, formData: FormData): Promise<SettingsActionState> {
  await verifySession("staff:manage");
  const parsed = staffInputFromForm(formData, false);
  if (!parsed.success) return validationState(parsed.error);
  if (!parsed.data.password) return { status: "error", message: "Masukkan kata sandi untuk akun staf ini." };
  const passwordHash = await hash(parsed.data.password, 12);
  let id: string;
  try {
    const [created] = await db.insert(users).values({ name: parsed.data.name, email: parsed.data.email, role: parsed.data.role, passwordHash }).returning({ id: users.id });
    if (!created) return { status: "error", message: "Kami tidak dapat membuat akun staf." };
    id = created.id;
  } catch (error) { return { status: "error", message: uniqueMessage(error, "staff account") }; }
  revalidatePath("/dashboard/settings");
  redirect(`/dashboard/settings/staff/${id}?created=1`);
}

export async function updateStaffAction(id: string, _state: SettingsActionState, formData: FormData): Promise<SettingsActionState> {
  await verifySession("staff:manage");
  if (!idSchema.safeParse(id).success) return { status: "error", message: "Akun staf tidak ditemukan." };
  const parsed = staffInputFromForm(formData, true);
  if (!parsed.success) return validationState(parsed.error);
  const passwordHash = parsed.data.password ? await hash(parsed.data.password, 12) : undefined;
  try {
    const outcome = await db.transaction(async (tx) => {
      const [current] = await tx.select({ id: users.id, role: users.role }).from(users).where(eq(users.id, id)).for("update").limit(1);
      if (!current) return "Akun staf tidak ditemukan.";
      const [admins] = await tx.select({ value: count() }).from(users).where(eq(users.role, "ADMIN"));
      if (!canChangeStaffRole(current.role, parsed.data.role, admins?.value ?? 0)) return "Tetapkan administrator lain sebelum mengubah peran administrator terakhir.";
      const revokesSession = current.role !== parsed.data.role || Boolean(passwordHash);
      await tx.update(users).set({
        name: parsed.data.name,
        email: parsed.data.email,
        role: parsed.data.role,
        ...(passwordHash ? { passwordHash } : {}),
        ...(revokesSession ? { sessionVersion: sql`${users.sessionVersion} + 1` } : {}),
        updatedAt: new Date(),
      }).where(eq(users.id, id));
      return null;
    });
    if (outcome) return { status: "error", message: outcome };
  } catch (error) { return { status: "error", message: uniqueMessage(error, "staff account") }; }
  revalidatePath("/dashboard/settings");
  redirect(`/dashboard/settings/staff/${id}?updated=1`);
}

export async function deleteStaffAction(id: string, _state: SettingsActionState, _formData: FormData): Promise<SettingsActionState> {
  void _state;
  void _formData;
  const session = await verifySession("staff:manage");
  if (!idSchema.safeParse(id).success) return { status: "error", message: "Akun staf tidak ditemukan." };
  const outcome = await db.transaction(async (tx) => {
    const [target] = await tx.select({ id: users.id, role: users.role }).from(users).where(eq(users.id, id)).for("update").limit(1);
    if (!target) return "Akun staf tidak ditemukan.";
    const [admins] = await tx.select({ value: count() }).from(users).where(eq(users.role, "ADMIN"));
    const [created] = await tx.select({ value: count() }).from(reservations).where(eq(reservations.createdBy, id));
    const guard = canDeleteStaff({ actorId: session.user.id, targetId: target.id, targetRole: target.role, adminCount: admins?.value ?? 0, createdReservationCount: created?.value ?? 0 });
    if (!guard.allowed) return guard.reason;
    await tx.delete(users).where(eq(users.id, id));
    return null;
  });
  if (outcome) return { status: "error", message: outcome };
  revalidatePath("/dashboard/settings");
  redirect("/dashboard/settings?tab=staff&deleted=1");
}

export async function wipeDatabaseAction(_state: SettingsActionState, _formData: FormData): Promise<SettingsActionState> {
  await verifySession("staff:manage");
  try {
    await db.transaction(async (tx) => {
      await tx.execute(sql`TRUNCATE TABLE reservations, guests, beds, rooms, locations CASCADE`);
      await tx.execute(sql`DELETE FROM users WHERE role != 'ADMIN'`);
      await tx.execute(sql`SELECT setval('reservation_booking_number_seq', 1, false)`);
    });
    revalidateOperations();
    return { status: "success", message: "Database berhasil dibersihkan (kecuali login Administrator)." };
  } catch (error) {
    console.error("Wipe database failed:", error);
    return { status: "error", message: "Gagal membersihkan database." };
  }
}

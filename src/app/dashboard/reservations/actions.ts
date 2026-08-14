"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { reservations, beds, guests, type ReservationStatus } from "@/db/schema";
import { verifySession } from "@/lib/dal";
import { canTransition } from "@/modules/reservations/status-transition";
import { findOverlappingReservation, findConflictingGenderReservation } from "@/modules/reservations/queries";
import { searchGuests } from "@/modules/guests/queries";
import { reservationInputFromForm, createReservationInputFromForm } from "@/modules/reservations/validation";
import { hotelDate } from "@/lib/hotel-date";
import { addCalendarDays } from "@/modules/calendar/date-window";

export async function searchGuestsAction(query: string) {
  await verifySession("reservations:manage");
  return searchGuests(query);
}

export type ReservationActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

function databaseMessage(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
  if (code === "23P01") return "Kasur tersebut baru saja dipesan untuk tanggal yang tumpang tindih. Pilih kasur atau tanggal lain.";
  if (code === "23503") return "Tamu atau kasur yang dipilih tidak lagi tersedia. Segarkan halaman dan coba lagi.";
  return "Kami tidak dapat menyimpan reservasi. Silakan coba lagi.";
}

function invalidInput(result: ReturnType<typeof reservationInputFromForm> | ReturnType<typeof createReservationInputFromForm>): ReservationActionState | undefined {
  if (result.success) return;
  return { status: "error", message: "Periksa detail reservasi yang disorot.", fieldErrors: result.error.flatten().fieldErrors };
}

export async function createReservationAction(
  _previousState: ReservationActionState,
  formData: FormData,
): Promise<ReservationActionState> {
  const session = await verifySession("reservations:manage");
  const result = createReservationInputFromForm(formData);
  const errorState = invalidInput(result);
  if (errorState || !result.success) return errorState!;

  const overlap = await findOverlappingReservation(result.data.roomId, result.data.checkInDate, result.data.checkOutDate);
  if (overlap) return { status: "error", message: `Konflik kasur dengan ${overlap.bookingCode}. Pilih kasur atau tanggal lain.` };

  // Gender lock check
  const [bed] = await db.select({ roomId: beds.roomId }).from(beds).where(eq(beds.id, result.data.roomId)).limit(1);
  const [guest] = await db.select({ gender: guests.gender }).from(guests).where(eq(guests.id, result.data.guestId)).limit(1);
  
  if (bed && guest) {
    const genderConflict = await findConflictingGenderReservation(bed.roomId, guest.gender, result.data.checkInDate, result.data.checkOutDate);
    if (genderConflict) {
      const conflictGenderLabel = genderConflict.gender === "MALE" ? "Laki - Laki" : "Perempuan";
      return { status: "error", message: `Kamar ini sudah dikunci untuk tamu ${conflictGenderLabel} pada tanggal tersebut. Pilih kasur di kamar lain.` };
    }
  }

  let id: string;
  try {
    const { roomId: bedId, ...rest } = result.data;
    const [created] = await db
      .insert(reservations)
      .values({ ...rest, bedId, notes: result.data.notes || null, createdBy: session.user.id })
      .returning({ id: reservations.id });
    if (!created) return { status: "error", message: "Kami tidak dapat membuat reservasi." };
    id = created.id;
  } catch (error) {
    return { status: "error", message: databaseMessage(error) };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/reservations");
  redirect(`/dashboard/reservations/${id}?created=1`);
}

export async function updateReservationAction(
  id: string,
  _previousState: ReservationActionState,
  formData: FormData,
): Promise<ReservationActionState> {
  await verifySession("reservations:manage");
  const result = reservationInputFromForm(formData);
  const errorState = invalidInput(result);
  if (errorState || !result.success) return errorState!;

  const overlap = await findOverlappingReservation(result.data.roomId, result.data.checkInDate, result.data.checkOutDate, id);
  if (overlap) return { status: "error", message: `Konflik kasur dengan ${overlap.bookingCode}. Pilih kasur atau tanggal lain.` };

  // Gender lock check
  const [bed] = await db.select({ roomId: beds.roomId }).from(beds).where(eq(beds.id, result.data.roomId)).limit(1);
  const [guest] = await db.select({ gender: guests.gender }).from(guests).where(eq(guests.id, result.data.guestId)).limit(1);
  
  if (bed && guest) {
    const genderConflict = await findConflictingGenderReservation(bed.roomId, guest.gender, result.data.checkInDate, result.data.checkOutDate, id);
    if (genderConflict) {
      const conflictGenderLabel = genderConflict.gender === "MALE" ? "Laki - Laki" : "Perempuan";
      return { status: "error", message: `Kamar ini sudah dikunci untuk tamu ${conflictGenderLabel} pada tanggal tersebut. Pilih kasur di kamar lain.` };
    }
  }

  try {
    const outcome = await db.transaction(async (tx) => {
      const [current] = await tx.select({ status: reservations.status }).from(reservations).where(eq(reservations.id, id)).for("update").limit(1);
      if (!current) return "Reservasi tidak ditemukan.";
      if (current.status !== "CONFIRMED") return "Hanya reservasi yang telah dikonfirmasi yang dapat diedit.";
      
      const { roomId: bedId, ...rest } = result.data;
      await tx
        .update(reservations)
        .set({ ...rest, bedId, notes: result.data.notes || null, updatedAt: new Date() })
        .where(eq(reservations.id, id));
      return null;
    });
    if (outcome) return { status: "error", message: outcome };
  } catch (error) {
    return { status: "error", message: databaseMessage(error) };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/reservations");
  revalidatePath(`/dashboard/reservations/${id}`);
  redirect(`/dashboard/reservations/${id}?updated=1`);
}

export async function transitionReservationAction(
  id: string,
  target: ReservationStatus,
  _previousState: ReservationActionState,
  formData: FormData,
): Promise<ReservationActionState> {
  await verifySession("reservations:manage");
  if (!["CHECKED_IN", "CHECKED_OUT", "CANCELLED"].includes(target)) {
    return { status: "error", message: "Tindakan reservasi tidak didukung." };
  }
  const forceRoom = formData.get("forceRoom") === "on";

  const statusLabels: Record<string, string> = {
    CONFIRMED: "dikonfirmasi",
    CHECKED_IN: "check-in",
    CHECKED_OUT: "check-out",
    CANCELLED: "dibatalkan",
  };

  const bedStatusLabels: Record<string, string> = {
    CLEAN: "bersih",
    DIRTY: "kotor",
    MAINTENANCE: "pemeliharaan",
    OUT_OF_ORDER: "rusak",
  };

  try {
    const outcome = await db.transaction(async (tx) => {
      const [current] = await tx
        .select({
          status: reservations.status,
          bedId: reservations.bedId,
          bedNumber: beds.bedNumber,
          bedStatus: beds.status,
          checkInDate: reservations.checkInDate,
        })
        .from(reservations)
        .innerJoin(beds, eq(reservations.bedId, beds.id))
        .where(eq(reservations.id, id))
        .for("update")
        .limit(1);

      if (!current) return { error: "Reservasi tidak ditemukan." };
      if (!canTransition(current.status, target)) return { error: `Reservasi ini tidak dapat berpindah dari ${statusLabels[current.status]} ke ${statusLabels[target]}.` };
      if (target === "CHECKED_IN" && current.bedStatus !== "CLEAN" && !forceRoom) {
        return { error: `Kasur ${current.bedNumber} berstatus ${bedStatusLabels[current.bedStatus]}. Konfirmasikan pengabaian untuk melanjutkan.` };
      }

      let checkOutDateUpdate = {};
      if (target === "CHECKED_OUT") {
        const today = hotelDate();
        const safeCheckout = today > current.checkInDate ? today : addCalendarDays(current.checkInDate, 1);
        checkOutDateUpdate = { checkOutDate: safeCheckout };
      }

      await tx.update(reservations).set({ status: target, ...checkOutDateUpdate, updatedAt: new Date() }).where(eq(reservations.id, id));
      if (target === "CHECKED_OUT") {
        await tx.update(beds).set({ status: "DIRTY", updatedAt: new Date() }).where(eq(beds.id, current.bedId));
      }
      return { error: null };
    });

    if (outcome.error) return { status: "error", message: outcome.error };
  } catch {
    return { status: "error", message: "Reservasi berubah saat Anda sedang memproses. Segarkan halaman dan coba lagi." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/reservations");
  revalidatePath(`/dashboard/reservations/${id}`);
  return { status: "success", message: target === "CHECKED_IN" ? "Tamu telah check-in." : target === "CHECKED_OUT" ? "Tamu telah check-out dan kasur ditandai sebagai kotor." : "Reservasi dibatalkan." };
}

"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db/client";
import { reservations, beds } from "@/db/schema";
import { verifySession } from "@/lib/dal";
import { canSetRoomStatus } from "@/modules/housekeeping/status-rules";

const bedIdSchema = z.string().uuid();
const bedStatusSchema = z.enum(["CLEAN", "DIRTY", "MAINTENANCE", "OUT_OF_ORDER"]);

export type RoomStatusActionState = { status: "idle" | "error" | "success"; message?: string };

export async function updateRoomStatusAction(bedId: string, _previousState: RoomStatusActionState, formData: FormData): Promise<RoomStatusActionState> {
  await verifySession("housekeeping:update");
  const parsedId = bedIdSchema.safeParse(bedId);
  const parsedStatus = bedStatusSchema.safeParse(formData.get("status"));
  if (!parsedId.success || !parsedStatus.success) return { status: "error", message: "Pilih status kasur yang valid." };

  const statusLabels: Record<string, string> = {
    CLEAN: "bersih",
    DIRTY: "kotor",
    MAINTENANCE: "pemeliharaan",
    OUT_OF_ORDER: "rusak",
  };

  try {
    const outcome = await db.transaction(async (tx) => {
      const [bed] = await tx.select({ id: beds.id, bedNumber: beds.bedNumber, status: beds.status }).from(beds).where(eq(beds.id, parsedId.data)).for("update").limit(1);
      if (!bed) return { error: "Kasur tidak ditemukan." };
      const [activeStay] = await tx
        .select({ bookingCode: reservations.bookingCode })
        .from(reservations)
        .where(and(eq(reservations.bedId, bed.id), eq(reservations.status, "CHECKED_IN")))
        .for("update")
        .limit(1);
      if (!canSetRoomStatus(parsedStatus.data, Boolean(activeStay))) return { error: `Kasur ${bed.bedNumber} sedang ditempati tamu. Lakukan check-out tamu sebelum mengatur status pemeliharaan.` };
      if (bed.status !== parsedStatus.data) await tx.update(beds).set({ status: parsedStatus.data, updatedAt: new Date() }).where(eq(beds.id, bed.id));
      return { error: null };
    });
    if (outcome.error) return { status: "error", message: outcome.error };
  } catch {
    return { status: "error", message: "Kasur berubah saat Anda sedang memproses. Segarkan halaman dan coba lagi." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/housekeeping");
  return { status: "success", message: `Kasur ditandai sebagai ${statusLabels[parsedStatus.data]}.` };
}

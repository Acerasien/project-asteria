"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { guests } from "@/db/schema";
import { verifySession } from "@/lib/dal";
import { findDuplicateGuest } from "@/modules/guests/queries";
import { guestInputFromForm } from "@/modules/guests/validation";

export type GuestActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  duplicateId?: string;
  fieldErrors?: Record<string, string[]>;
};

function invalidInput(result: ReturnType<typeof guestInputFromForm>): GuestActionState | undefined {
  if (result.success) return;
  return { status: "error", message: "Periksa detail tamu yang disorot.", fieldErrors: result.error.flatten().fieldErrors };
}

async function duplicateState(data: { fullName: string; phone: string; idNumber: string }, excludeId?: string) {
  const duplicate = await findDuplicateGuest(data, excludeId);
  if (!duplicate) return undefined;
  return { status: "error", message: `${duplicate.fullName} sudah cocok dengan nomor identitas ini atau nama dan telepon.`, duplicateId: duplicate.id } satisfies GuestActionState;
}

export async function createGuestAction(_previousState: GuestActionState, formData: FormData): Promise<GuestActionState> {
  await verifySession("guests:manage");
  const result = guestInputFromForm(formData);
  const errorState = invalidInput(result);
  if (errorState || !result.success) return errorState!;
  const duplicate = await duplicateState(result.data);
  if (duplicate) return duplicate;

  let id: string;
  try {
    const [created] = await db.insert(guests).values(result.data).returning({ id: guests.id });
    if (!created) return { status: "error", message: "Kami tidak dapat membuat catatan tamu." };
    id = created.id;
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
    if (code === "23505") return (await duplicateState(result.data)) ?? { status: "error", message: "Catatan tamu yang cocok sudah ada." };
    return { status: "error", message: "Kami tidak dapat membuat catatan tamu. Silakan coba lagi." };
  }

  revalidatePath("/dashboard/guests");
  revalidatePath("/dashboard/reservations/new");
  redirect(`/dashboard/guests/${id}?created=1`);
}

export async function updateGuestAction(id: string, _previousState: GuestActionState, formData: FormData): Promise<GuestActionState> {
  await verifySession("guests:manage");
  const result = guestInputFromForm(formData);
  const errorState = invalidInput(result);
  if (errorState || !result.success) return errorState!;
  const duplicate = await duplicateState(result.data, id);
  if (duplicate) return duplicate;

  try {
    const outcome = await db.transaction(async (tx) => {
      const [current] = await tx.select({ id: guests.id }).from(guests).where(eq(guests.id, id)).for("update").limit(1);
      if (!current) return "Catatan tamu tidak ditemukan.";
      await tx.update(guests).set({ ...result.data, updatedAt: new Date() }).where(eq(guests.id, id));
      return null;
    });
    if (outcome) return { status: "error", message: outcome };
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
    if (code === "23505") return (await duplicateState(result.data, id)) ?? { status: "error", message: "Catatan tamu yang cocok sudah ada." };
    return { status: "error", message: "Kami tidak dapat memperbarui catatan tamu. Silakan coba lagi." };
  }

  revalidatePath("/dashboard/guests");
  revalidatePath(`/dashboard/guests/${id}`);
  revalidatePath("/dashboard/reservations/new");
  redirect(`/dashboard/guests/${id}?updated=1`);
}


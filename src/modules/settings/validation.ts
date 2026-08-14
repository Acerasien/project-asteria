import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).transform((value) => value || null);

export const roomTypeInputSchema = z.object({
  name: z.string().trim().min(2, "Masukkan nama kamar.").max(80, "Nama harus 80 karakter atau kurang.").transform((value) => value.replace(/\s+/g, " ")),
  locationId: z.string().uuid("Pilih lokasi.").nullable().optional(),
  isMixedGender: z.boolean().default(false),
  description: optionalText(500),
});

export const roomTypeCreateInputSchema = roomTypeInputSchema.extend({
  bedCount: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : val),
    z.coerce.number().int().min(1, "Jumlah kasur minimal 1.").max(50, "Jumlah kasur maksimal 50.").optional()
  ).optional().nullable(),
  bedPrefix: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? "Kasur" : val),
    z.string().trim().max(9, "Prefiks nama kasur maksimal 9 karakter.")
  ).optional().nullable(),
});

export const locationInputSchema = z.object({
  name: z.string().trim().min(2, "Masukkan nama lokasi.").max(100, "Nama harus 100 karakter atau kurang.").transform((value) => value.replace(/\s+/g, " ")),
  description: optionalText(500),
});

export const roomInputSchema = z.object({
  bedNumber: z.string().trim().min(1, "Masukkan nomor kasur.").max(12, "Nomor kasur harus 12 karakter atau kurang.").regex(/^[A-Za-z0-9- ]+$/, "Gunakan huruf, angka, spasi, atau tanda hubung saja.").transform((value) => value.toUpperCase()),
  roomId: z.string().uuid("Pilih kamar."),
  status: z.enum(["CLEAN", "DIRTY", "MAINTENANCE", "OUT_OF_ORDER"]),
  isTemporary: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

const staffBase = z.object({
  name: z.string().trim().min(2, "Masukkan nama staf.").max(120, "Nama harus 120 karakter atau kurang.").transform((value) => value.replace(/\s+/g, " ")),
  email: z.string().trim().email("Masukkan alamat email yang valid.").max(254).transform((value) => value.toLowerCase()),
  role: z.enum(["ADMIN", "FRONT_DESK", "HOUSEKEEPING"]),
});

export const staffCreateInputSchema = staffBase.extend({ password: z.string().min(8, "Kata sandi harus terdiri dari minimal 8 karakter.").max(128) });
export const staffUpdateInputSchema = staffBase.extend({ password: z.string().max(128).refine((value) => !value || value.length >= 8, "Kata sandi baru harus terdiri dari minimal 8 karakter.").transform((value) => value || null) });

export function roomTypeInputFromForm(formData: FormData, isCreation = false) {
  const locId = formData.get("locationId");
  const isMixed = formData.get("isMixedGender") === "on" || formData.get("isMixedGender") === "true";
  const raw = {
    name: formData.get("name"),
    locationId: locId ? String(locId) : null,
    isMixedGender: isMixed,
    description: formData.get("description") ?? "",
    ...(isCreation ? {
      bedCount: formData.get("bedCount") || null,
      bedPrefix: formData.get("bedPrefix") || null,
    } : {}),
  };
  return isCreation ? roomTypeCreateInputSchema.safeParse(raw) : roomTypeInputSchema.safeParse(raw);
}

export function locationInputFromForm(formData: FormData) {
  return locationInputSchema.safeParse({ name: formData.get("name"), description: formData.get("description") ?? "" });
}

export function roomInputFromForm(formData: FormData) {
  const isTemp = formData.get("isTemporary") === "on" || formData.get("isTemporary") === "true";
  const isAct = formData.get("isActive") === "on" || formData.get("isActive") === "true";

  return roomInputSchema.safeParse({
    bedNumber: formData.get("roomNumber"),
    roomId: formData.get("roomTypeId"),
    status: formData.get("status"),
    isTemporary: isTemp,
    isActive: isAct,
  });
}

export function staffInputFromForm(formData: FormData, editing: boolean) {
  const raw = { name: formData.get("name"), email: formData.get("email"), role: formData.get("role"), password: formData.get("password") ?? "" };
  return editing ? staffUpdateInputSchema.safeParse(raw) : staffCreateInputSchema.safeParse(raw);
}

import { z } from "zod";

const phonePattern = /^[+\d][\d\s().-]{4,31}$/;

export const guestInputSchema = z.object({
  fullName: z.string().trim().min(2, "Masukkan nama lengkap tamu.").max(120, "Nama harus 120 karakter atau kurang.").transform((value) => value.replace(/\s+/g, " ")),
  gender: z.enum(["MALE", "FEMALE"], { message: "Pilih jenis kelamin." }),
  phone: z.string().trim().min(5, "Masukkan nomor telepon.").max(32, "Nomor telepon harus 32 karakter atau kurang.").regex(phonePattern, "Masukkan nomor telepon yang valid.").transform((value) => value.replace(/\s+/g, " ")),
  email: z.string().trim().max(254, "Email harus 254 karakter atau kurang.").refine((value) => !value || z.email().safeParse(value).success, "Masukkan alamat email yang valid.").transform((value) => value ? value.toLowerCase() : null),
  idNumber: z.string().trim().min(3, "Masukkan nomor paspor atau KTP.").max(64, "Nomor identitas harus 64 karakter atau kurang.").transform((value) => value.toUpperCase()),
  notes: z.string().trim().max(2000, "Catatan harus 2.000 karakter atau kurang.").transform((value) => value || null),
});

export type GuestInput = z.infer<typeof guestInputSchema>;

export function guestInputFromForm(formData: FormData) {
  return guestInputSchema.safeParse({
    fullName: formData.get("fullName"),
    gender: formData.get("gender"),
    phone: formData.get("phone"),
    email: formData.get("email") ?? "",
    idNumber: formData.get("idNumber"),
    notes: formData.get("notes") ?? "",
  });
}

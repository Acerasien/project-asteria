import { z } from "zod";
import { hotelDate } from "@/lib/hotel-date";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pilih tanggal yang valid.");

export const reservationInputSchema = z
  .object({
    guestId: z.string().uuid("Pilih tamu."),
    roomId: z.string().uuid("Pilih kasur."),
    checkInDate: isoDate,
    checkOutDate: isoDate,
    notes: z.string().trim().max(1000, "Catatan harus 1.000 karakter atau kurang."),
  })
  .refine((value) => value.checkOutDate > value.checkInDate, {
    message: "Tanggal check-out harus setelah tanggal check-in.",
    path: ["checkOutDate"],
  });

export const createReservationSchema = reservationInputSchema.refine(
  (value) => value.checkInDate >= hotelDate(),
  {
    message: "Tanggal check-in tidak boleh di masa lalu.",
    path: ["checkInDate"],
  }
);

export type ReservationInput = z.infer<typeof reservationInputSchema>;

export function reservationInputFromForm(formData: FormData) {
  return reservationInputSchema.safeParse({
    guestId: formData.get("guestId"),
    roomId: formData.get("roomId"), // will map to bedId later
    checkInDate: formData.get("checkInDate"),
    checkOutDate: formData.get("checkOutDate"),
    notes: formData.get("notes") ?? "",
  });
}

export function createReservationInputFromForm(formData: FormData) {
  return createReservationSchema.safeParse({
    guestId: formData.get("guestId"),
    roomId: formData.get("roomId"),
    checkInDate: formData.get("checkInDate"),
    checkOutDate: formData.get("checkOutDate"),
    notes: formData.get("notes") ?? "",
  });
}



import { describe, expect, it } from "vitest";
import { reservationInputSchema, createReservationSchema } from "./validation";
import { hotelDate } from "@/lib/hotel-date";

const today = hotelDate();
const tomorrow = hotelDate(1);
const dayAfter = hotelDate(2);
const yesterday = hotelDate(-1);
const beforeYesterday = hotelDate(-2);

const validInput = {
  guestId: "7fc20c6a-bca5-4a76-a590-9a7e485b82df",
  roomId: "69e4fc89-12f4-4267-b1b9-bf592a1a5cb4",
  checkInDate: tomorrow,
  checkOutDate: dayAfter,
  notes: "Late arrival",
};

describe("reservation input validation", () => {
  it("accepts a stay with a later check-out", () => {
    expect(reservationInputSchema.safeParse(validInput).success).toBe(true);
  });

  it("rejects same-day or backwards stays", () => {
    expect(reservationInputSchema.safeParse({ ...validInput, checkOutDate: tomorrow }).success).toBe(false);
    expect(reservationInputSchema.safeParse({ ...validInput, checkOutDate: today }).success).toBe(false);
  });

  it("rejects malformed identifiers and dates", () => {
    expect(reservationInputSchema.safeParse({ ...validInput, guestId: "guest", checkInDate: "11/08/2026" }).success).toBe(false);
  });

  describe("create reservation schema validation", () => {
    it("allows yesterday, today, or future check-in dates", () => {
      expect(createReservationSchema.safeParse({ ...validInput, checkInDate: yesterday, checkOutDate: today }).success).toBe(true);
      expect(createReservationSchema.safeParse({ ...validInput, checkInDate: today, checkOutDate: tomorrow }).success).toBe(true);
      expect(createReservationSchema.safeParse({ ...validInput, checkInDate: tomorrow, checkOutDate: dayAfter }).success).toBe(true);
    });

    it("rejects check-in dates before yesterday", () => {
      expect(createReservationSchema.safeParse({ ...validInput, checkInDate: beforeYesterday, checkOutDate: today }).success).toBe(false);
    });
  });
});



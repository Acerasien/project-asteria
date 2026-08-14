import { describe, expect, it } from "vitest";
import { canTransition, type ReservationStatus } from "./status-transition";

describe("reservation status transitions", () => {
  const allowed: Array<[ReservationStatus, ReservationStatus]> = [
    ["CONFIRMED", "CHECKED_IN"],
    ["CONFIRMED", "CANCELLED"],
    ["CHECKED_IN", "CHECKED_OUT"],
    ["CHECKED_IN", "CANCELLED"],
  ];

  it.each(allowed)("allows %s to become %s", (from, to) => {
    expect(canTransition(from, to)).toBe(true);
  });

  it("rejects terminal and backwards transitions", () => {
    expect(canTransition("CHECKED_OUT", "CHECKED_IN")).toBe(false);
    expect(canTransition("CANCELLED", "CONFIRMED")).toBe(false);
    expect(canTransition("CONFIRMED", "CHECKED_OUT")).toBe(false);
  });
});

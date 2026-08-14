import { describe, expect, it } from "vitest";
import { guestInputSchema } from "./validation";

const validGuest = { fullName: "  Maya   Santoso ", gender: "FEMALE", phone: "+62 812 555 0199", email: "MAYA@EXAMPLE.COM", idNumber: " id-4421 ", notes: "  Returning guest  " };

describe("guest input", () => {
  it("normalizes guest identity fields", () => {
    expect(guestInputSchema.parse(validGuest)).toEqual({ fullName: "Maya Santoso", gender: "FEMALE", phone: "+62 812 555 0199", email: "maya@example.com", idNumber: "ID-4421", notes: "Returning guest" });
  });

  it("allows optional email and notes", () => {
    expect(guestInputSchema.parse({ ...validGuest, email: "", notes: "" })).toMatchObject({ email: null, notes: null });
  });

  it("rejects invalid contact and identity data", () => {
    expect(guestInputSchema.safeParse({ ...validGuest, phone: "abc", email: "invalid", idNumber: "x" }).success).toBe(false);
  });
});


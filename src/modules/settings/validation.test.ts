import { describe, expect, it } from "vitest";
import { locationInputSchema, roomInputSchema, roomTypeInputSchema, roomTypeCreateInputSchema, staffCreateInputSchema, staffUpdateInputSchema } from "./validation";

describe("settings input validation", () => {
  it("normalizes room types, locations, and room numbers", () => {
    const validUuid = "7fc20c6a-bca5-4a76-a590-9a7e485b82df";
    expect(roomTypeInputSchema.parse({ name: " Deluxe   King ", locationId: validUuid, isMixedGender: true, description: "" })).toMatchObject({ name: "Deluxe King", locationId: validUuid, isMixedGender: true, description: null });
    expect(locationInputSchema.parse({ name: " Lantai   1 ", description: "" })).toMatchObject({ name: "Lantai 1", description: null });
    expect(roomInputSchema.parse({ bedNumber: " kasur 8 ", roomId: validUuid, status: "CLEAN" })).toMatchObject({ bedNumber: "KASUR 8", isTemporary: false, isActive: true });
    expect(roomInputSchema.parse({ bedNumber: "KASUR 8", roomId: validUuid, status: "CLEAN", isTemporary: true, isActive: false })).toMatchObject({ bedNumber: "KASUR 8", isTemporary: true, isActive: false });
  });

  it("validates roomTypeCreateInputSchema limits", () => {
    const base = { name: "Suite Room", locationId: null, isMixedGender: false, description: "" };
    
    // Valid count and prefix
    expect(roomTypeCreateInputSchema.parse({ ...base, bedCount: 10, bedPrefix: "Kasur" })).toMatchObject({
      bedCount: 10,
      bedPrefix: "Kasur",
    });

    // Valid empty inputs (defaults used)
    expect(roomTypeCreateInputSchema.parse({ ...base, bedCount: "", bedPrefix: "" })).toMatchObject({
      bedCount: undefined,
      bedPrefix: "Kasur", // uses default
    });

    // Invalid bed count (0 or 51)
    expect(roomTypeCreateInputSchema.safeParse({ ...base, bedCount: 0 }).success).toBe(false);
    expect(roomTypeCreateInputSchema.safeParse({ ...base, bedCount: 51 }).success).toBe(false);

    // Invalid bed prefix (too long: 10 characters)
    expect(roomTypeCreateInputSchema.safeParse({ ...base, bedCount: 5, bedPrefix: "KasurLantai" }).success).toBe(false);
  });

  it("rejects invalid inputs", () => {
    expect(roomTypeInputSchema.safeParse({ name: "", description: "" }).success).toBe(false);
    expect(locationInputSchema.safeParse({ name: "", description: "" }).success).toBe(false);
    expect(roomInputSchema.safeParse({ bedNumber: "10 1", roomId: "bad", status: "UNKNOWN" }).success).toBe(false);
  });

  it("requires passwords for new staff but makes resets optional during editing", () => {
    const base = { name: "Night Manager", email: "night@hotel.local", role: "ADMIN" };
    expect(staffCreateInputSchema.safeParse({ ...base, password: "short" }).success).toBe(false);
    expect(staffCreateInputSchema.safeParse({ ...base, password: "secure123" }).success).toBe(true);
    expect(staffUpdateInputSchema.safeParse({ ...base, password: "" }).success).toBe(true);
  });
});


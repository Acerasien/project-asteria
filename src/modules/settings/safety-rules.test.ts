import { describe, expect, it } from "vitest";
import { bulkRoomStatusAllowed, canChangeStaffRole, canDeleteStaff } from "./safety-rules";

describe("settings safety rules", () => {
  it("protects the current and final administrator", () => {
    expect(canDeleteStaff({ actorId: "a", targetId: "a", targetRole: "ADMIN", adminCount: 2, createdReservationCount: 0 }).allowed).toBe(false);
    expect(canDeleteStaff({ actorId: "a", targetId: "b", targetRole: "ADMIN", adminCount: 1, createdReservationCount: 0 }).allowed).toBe(false);
    expect(canChangeStaffRole("ADMIN", "FRONT_DESK", 1)).toBe(false);
  });

  it("retains staff with reservation audit history", () => {
    expect(canDeleteStaff({ actorId: "a", targetId: "b", targetRole: "FRONT_DESK", adminCount: 1, createdReservationCount: 3 }).allowed).toBe(false);
  });

  it("blocks maintenance bulk updates when selected rooms are occupied", () => {
    expect(bulkRoomStatusAllowed("MAINTENANCE", ["101"]).allowed).toBe(false);
    expect(bulkRoomStatusAllowed("OUT_OF_ORDER", ["101", "102"]).allowed).toBe(false);
    expect(bulkRoomStatusAllowed("DIRTY", ["101"]).allowed).toBe(true);
  });
});


import { describe, expect, it } from "vitest";
import { canSetRoomStatus } from "./status-rules";

describe("housekeeping room-status rules", () => {
  it("allows every status for an unoccupied room", () => {
    expect(["CLEAN", "DIRTY", "MAINTENANCE", "OUT_OF_ORDER"].every((status) => canSetRoomStatus(status as never, false))).toBe(true);
  });

  it("blocks maintenance states while a guest is checked in", () => {
    expect(canSetRoomStatus("MAINTENANCE", true)).toBe(false);
    expect(canSetRoomStatus("OUT_OF_ORDER", true)).toBe(false);
  });

  it("allows servicing states for an occupied room", () => {
    expect(canSetRoomStatus("CLEAN", true)).toBe(true);
    expect(canSetRoomStatus("DIRTY", true)).toBe(true);
  });
});


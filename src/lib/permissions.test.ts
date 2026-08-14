import { describe, expect, it } from "vitest";
import { can } from "./permissions";

describe("role permissions", () => {
  it("gives administrators full operational and staff access", () => {
    expect(can("ADMIN", "staff:manage")).toBe(true);
    expect(can("ADMIN", "reservations:manage")).toBe(true);
  });

  it("limits front desk staff to operational workflows", () => {
    expect(can("FRONT_DESK", "reservations:manage")).toBe(true);
    expect(can("FRONT_DESK", "staff:manage")).toBe(false);
  });

  it("limits housekeeping to dashboard and room status work", () => {
    expect(can("HOUSEKEEPING", "housekeeping:update")).toBe(true);
    expect(can("HOUSEKEEPING", "calendar:view")).toBe(false);
    expect(can("HOUSEKEEPING", "guests:manage")).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { addCalendarDays, calendarDates, intersectsCalendarWindow, isIsoDate, parseCalendarParams } from "./date-window";

describe("calendar date window", () => {
  it("validates real ISO dates", () => {
    expect(isIsoDate("2026-02-28")).toBe(true);
    expect(isIsoDate("2026-02-30")).toBe(false);
    expect(isIsoDate("28/02/2026")).toBe(false);
  });

  it("moves safely across month and year boundaries", () => {
    expect(parseCalendarParams({ location: "foo" }).location).toBe("foo");
    expect(parseCalendarParams({ location: ["foo", "bar"] }).location).toBe("foo");
    expect(addCalendarDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addCalendarDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("generates an exact date window", () => {
    expect(calendarDates("2026-08-30", 7)).toEqual([
      "2026-08-30", "2026-08-31", "2026-09-01", "2026-09-02", "2026-09-03", "2026-09-04", "2026-09-05",
    ]);
  });

  it("uses half-open overlap semantics", () => {
    expect(intersectsCalendarWindow("2026-08-09", "2026-08-11", "2026-08-11", "2026-08-18")).toBe(false);
    expect(intersectsCalendarWindow("2026-08-17", "2026-08-18", "2026-08-11", "2026-08-18")).toBe(true);
    expect(intersectsCalendarWindow("2026-08-18", "2026-08-19", "2026-08-11", "2026-08-18")).toBe(false);
  });

  it("normalizes supported filters and rejects unsafe values", () => {
    expect(parseCalendarParams({ start: "2026-08-11", days: "30", location: "East Wing", status: "DIRTY" })).toMatchObject({ start: "2026-08-11", days: 30, location: "East Wing", status: "DIRTY", endExclusive: "2026-09-10" });
    expect(parseCalendarParams({ start: "invalid", days: "365", location: "", status: "UNKNOWN" })).toMatchObject({ days: 14, location: undefined, status: undefined });
  });
});


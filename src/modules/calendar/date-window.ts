import { hotelDate } from "@/lib/hotel-date";

export const calendarDayOptions = [7, 14, 30] as const;
export type CalendarDayCount = (typeof calendarDayOptions)[number];

export type CalendarSearchParams = {
  start?: string | string[];
  days?: string | string[];
  location?: string | string[]; // changed from floor to location
  status?: string | string[];
};

const roomStatuses = new Set(["CLEAN", "DIRTY", "MAINTENANCE", "OUT_OF_ORDER"] as const);

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function isIsoDate(value: string | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function addCalendarDays(value: string, amount: number) {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

export function calendarDates(start: string, days: CalendarDayCount) {
  return Array.from({ length: days }, (_, index) => addCalendarDays(start, index));
}

export function intersectsCalendarWindow(checkIn: string, checkOut: string, start: string, endExclusive: string) {
  return checkIn < endExclusive && checkOut > start;
}

export function parseCalendarParams(params: CalendarSearchParams) {
  const rawStart = first(params.start);
  const start = isIsoDate(rawStart) ? rawStart : hotelDate();
  const rawDays = Number(first(params.days));
  const days = calendarDayOptions.includes(rawDays as CalendarDayCount) ? (rawDays as CalendarDayCount) : 14;
  const rawLocation = first(params.location);
  const location = rawLocation || undefined;
  const rawStatus = first(params.status);
  const status = roomStatuses.has(rawStatus as never) ? (rawStatus as "CLEAN" | "DIRTY" | "MAINTENANCE" | "OUT_OF_ORDER") : undefined;
  // still returning 'floor' key mapped to location for now to reduce changes in page.tsx if possible, actually let's just return location
  return { start, days, location, floor: location, status, endExclusive: addCalendarDays(start, days), dates: calendarDates(start, days) };
}

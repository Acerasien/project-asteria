const hotelTimeZone = "Asia/Jakarta";

function dateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: hotelTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

export function hotelDate(offsetDays = 0) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offsetDays);
  const parts = dateParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function formatHotelDay(date = new Date()) {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: hotelTimeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

export function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", timeZone: "UTC" }).format(
    new Date(`${value}T12:00:00Z`),
  );
}

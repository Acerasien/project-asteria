export type ReservationStatus = "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED";

const allowedTransitions: Record<ReservationStatus, ReadonlySet<ReservationStatus>> = {
  CONFIRMED: new Set(["CHECKED_IN", "CANCELLED"]),
  CHECKED_IN: new Set(["CHECKED_OUT", "CANCELLED"]),
  CHECKED_OUT: new Set(),
  CANCELLED: new Set(),
};

export function canTransition(from: ReservationStatus, to: ReservationStatus) {
  return allowedTransitions[from].has(to);
}

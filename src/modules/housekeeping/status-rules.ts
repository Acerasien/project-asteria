import type { RoomStatus } from "@/db/schema";

export function canSetRoomStatus(target: RoomStatus, hasCheckedInGuest: boolean) {
  if (!hasCheckedInGuest) return true;
  return target !== "MAINTENANCE" && target !== "OUT_OF_ORDER";
}


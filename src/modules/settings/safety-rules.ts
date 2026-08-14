import type { RoomStatus } from "@/db/schema";
import type { StaffRole } from "@/lib/permissions";

export function canDeleteStaff(input: { actorId: string; targetId: string; targetRole: StaffRole; adminCount: number; createdReservationCount: number }) {
  if (input.actorId === input.targetId) return { allowed: false, reason: "Anda tidak dapat menghapus akun Anda sendiri." } as const;
  if (input.targetRole === "ADMIN" && input.adminCount <= 1) return { allowed: false, reason: "Administrator terakhir tidak dapat dihapus." } as const;
  if (input.createdReservationCount > 0) return { allowed: false, reason: "Akun staf ini dipertahankan karena telah membuat catatan reservasi." } as const;
  return { allowed: true, reason: null } as const;
}

export function canChangeStaffRole(currentRole: StaffRole, nextRole: StaffRole, adminCount: number) {
  return !(currentRole === "ADMIN" && nextRole !== "ADMIN" && adminCount <= 1);
}

export function bulkRoomStatusAllowed(target: RoomStatus, occupiedRoomNumbers: string[]) {
  if ((target === "MAINTENANCE" || target === "OUT_OF_ORDER") && occupiedRoomNumbers.length) {
    return { allowed: false, reason: `Tamu yang telah check-in menempati kamar ${occupiedRoomNumbers.join(", ")}.` } as const;
  }
  return { allowed: true, reason: null } as const;
}


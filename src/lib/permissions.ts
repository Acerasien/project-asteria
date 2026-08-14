export type StaffRole = "ADMIN" | "FRONT_DESK" | "HOUSEKEEPING";

export type Permission =
  | "dashboard:view"
  | "calendar:view"
  | "reservations:manage"
  | "guests:manage"
  | "housekeeping:view"
  | "housekeeping:update"
  | "rooms:manage"
  | "staff:manage";

const permissions: Record<StaffRole, ReadonlySet<Permission>> = {
  ADMIN: new Set([
    "dashboard:view",
    "calendar:view",
    "reservations:manage",
    "guests:manage",
    "housekeeping:view",
    "housekeeping:update",
    "rooms:manage",
    "staff:manage",
  ]),
  FRONT_DESK: new Set([
    "dashboard:view",
    "calendar:view",
    "reservations:manage",
    "guests:manage",
    "housekeeping:view",
    "housekeeping:update",
  ]),
  HOUSEKEEPING: new Set(["dashboard:view", "housekeeping:view", "housekeeping:update"]),
};

export function can(role: StaffRole, permission: Permission) {
  return permissions[role].has(permission);
}

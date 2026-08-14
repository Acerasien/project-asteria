# Slice 6 — Administrator Settings

## Understanding Summary

- Build an administrator-only Settings area for room types, rooms, and staff accounts.
- Support create, edit, and guarded deletion for all three administrative resources.
- Support transactional bulk room-status updates.
- Prevent deletion of records referenced by rooms or reservation history.
- Prevent occupied rooms from entering Maintenance or Out of order.
- Prevent self-deletion and removal or demotion of the final administrator.
- Hash new passwords and revoke existing sessions when staff roles or passwords change.

## Assumptions

- Only the `ADMIN` role may access settings queries or mutations.
- Current room, room-type, staff, reservation, and session-version columns are sufficient.
- Hard deletion is allowed only for records with no operational history or dependencies.
- Staff passwords are 8–128 characters and hashed with bcrypt cost 12.
- Lists remain small enough for direct tables at the current single-property scale.
- Destructive actions require explicit browser confirmation and server-side guard checks.

## Final Design

`/dashboard/settings` uses URL-driven tabs for Room types, Rooms, and Staff. Each tab presents an operational list and a clear create action. Create and edit use dedicated routes rather than modals, matching the reservation and guest workflows and giving dependency warnings enough space.

Room types expose name, capacity, description, and room count. Deletion is blocked while rooms reference the type. Rooms expose number, floor, type, readiness, and reservation-history count. Deletion is blocked for any room with reservations. The Rooms tab also supports checkbox-based bulk readiness updates in a single transaction; maintenance states reject the entire update when any selected room is occupied.

Staff management exposes name, email, and role. Creation hashes the password. Editing permits an optional password reset. Role or password changes increment `session_version`, immediately invalidating existing sessions. Self-deletion is rejected, as are deleting or demoting the last administrator. Staff with authored reservations cannot be deleted because audit attribution is retained.

## Decision Log

| Decision | Alternatives | Reason |
|---|---|---|
| URL tabs plus dedicated forms | Modal forms | Keeps workflows navigable, spacious, and mobile-safe. |
| Guarded hard deletion | Cascading deletes | Preserves reservation history and operational attribution. |
| Transactional all-or-nothing bulk status | Partial updates | Prevents unclear mixed outcomes and simplifies recovery. |
| Session-version increment | Waiting for JWT expiry | Revokes changed staff access immediately. |
| Explicit confirmation for delete | One-click deletion | Reduces accidental irreversible administration changes. |

## Verification Strategy

- Unit-test validation and last-admin/self-protection rules.
- Verify dependency guards, uniqueness, occupancy checks, and bulk rollback against PostgreSQL.
- Exercise authorized create/edit workflows without leaving test records behind.
- Verify non-admin access denial.
- Inspect 375px, 768px, and 1280px settings layouts.
- Run browser console checks, UI-quality detection, lint, type checking, tests, production build, and offline audit.


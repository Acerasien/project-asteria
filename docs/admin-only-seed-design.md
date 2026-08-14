# Administrator-Only Development Seed

## Understanding

- The development database should begin as a clean first-run hotel installation.
- Only the highest-privilege administrator account should exist after seeding.
- Room types, rooms, guests, reservations, and other staff will be configured through the application later.
- Seeding remains destructive and development-only.
- Repeated seed runs must produce the same state.

## Assumptions

- Preserve the existing development administrator identity and credentials.
- Reset reservation booking numbering alongside operational records.
- Demonstration data is no longer part of the default seed workflow.

## Decision Log

| Decision | Alternatives | Reason |
|---|---|---|
| Truncate and recreate | Preserve and reconcile the existing admin row | A deterministic reset is simpler, repeatable, and matches the existing destructive seed contract. |
| Insert one administrator | Retain sample staff and hotel records | Hotel configuration will be created through Settings during real use. |
| Keep the production guard | Allow environment-agnostic reset | Prevents accidental production data destruction. |

## Final Design

The seed loads local environment configuration, refuses to run in production, and performs all changes in one database transaction. It truncates reservations, guests, rooms, room types, and users, resets the reservation booking-number sequence, hashes the administrator password with bcrypt cost 12, and inserts only the administrator account. A successful run reports the clean first-run state.

# Slice 4 — Guest Management

## Understanding Summary

- Build a searchable guest directory for administrators and front-desk staff.
- Add guest creation and editing without creating guests inline during booking.
- Give each guest a profile containing contact details, internal notes, and complete reservation history.
- Prevent duplicate records by case-insensitive ID number and by normalized name plus phone.
- Reuse the existing reservation, authorization, form, table, and mobile interaction patterns.
- Keep guest deletion, merging, document uploads, and marketing communication outside this slice.

## Assumptions

- Guest data is operationally sensitive and visible only to roles with `guests:manage`.
- The property remains at boutique-hotel scale; server pagination of 25 records is sufficient.
- Search spans name, email, phone, and ID number and is capped to a safe input length.
- PostgreSQL constraints remain the final concurrency boundary for duplicate creation.
- Guest history is derived from reservations rather than stored as duplicated counters.
- The application remains locally owned and maintained as a modular Next.js monolith.

## Final Design

The directory is a server-rendered, URL-driven list with text search and pagination. Desktop uses a compact table showing name, phone, email, ID number, stay count, and last stay. Mobile uses linked records that prioritize name, phone, and stay summary.

Guest creation uses `/dashboard/guests/new`; guest profiles use `/dashboard/guests/[id]`. The profile presents identity and contact information first, reservation history second, and an edit form in the same page. Existing reservation detail routes remain the destination for booking history. This avoids modal state, preserves navigable URLs, and matches the reservation workflow.

All guest actions authorize independently and validate untrusted form data. Creation and update perform an actionable duplicate lookup before writing, while case-insensitive database uniqueness remains the race-condition safeguard. Duplicate errors link staff to the existing guest profile. Updates lock the guest row before applying changes.

## Decision Log

| Decision | Alternatives | Reason |
|---|---|---|
| Dedicated guest routes | Modal or inline booking creation | Keeps guest deduplication explicit and profiles directly navigable. |
| Derived stay statistics | Stored counters | Avoids synchronization bugs and preserves reservations as the source of truth. |
| Case-insensitive ID uniqueness plus name/phone matching | Application-only validation | Prevents concurrent duplicates while returning useful preflight errors. |
| No guest deletion in Slice 4 | Hard or soft delete | Reservation history must remain attributable; merging/deletion requires a separate policy. |
| Desktop table and mobile records | Horizontally compressed table | Preserves readability and touch targets on narrow screens. |

## Verification Strategy

- Unit-test form normalization and validation.
- Verify duplicate ID and name/phone protection in PostgreSQL.
- Verify directory search, pagination, derived stay totals, and history ordering.
- Verify authorization on queries and every mutation.
- Exercise create, profile, edit, and reservation-history navigation in the authenticated local app.
- Inspect at 375px, 768px, and 1280px and run the static UI-quality detector.
- Run lint, type checking, tests, production build, and offline dependency audit.


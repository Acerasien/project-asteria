# Implementation Plan

Build the application as a modular Next.js monolith and deliver it through vertical, runnable milestones. Slice 1 established PostgreSQL, authentication, responsive navigation, and the operational dashboard. Slice 2 added the complete reservation workflow. Slice 3 added the room availability calendar. Slice 4 added guest management. Slice 5 added the housekeeping room-status workflow. Slice 6 adds administrator settings for hotel inventory and staff access.

## Scope

- In through Slice 6: Next.js web application, PostgreSQL and Drizzle, Auth.js credentials login, role-aware navigation, live dashboard, complete reservation workflow, room availability calendar, guest management, floor-grouped housekeeping board, occupancy-safe room-status updates, administrator room-type/room/staff management, bulk room status updates, responsive states, automated tests, and production-build verification.
- Out through Slice 6: guest deletion/merging, staff deactivation and invitation emails, public booking, payments, invoicing, multi-property support, and drag-to-resize calendar bookings.

## Action Items

- [x] Confirm the product scope, non-functional assumptions, architecture, and vertical-slice approach.
- [x] Capture the product strategy and production visual system in `PRODUCT.md` and `DESIGN.md`.
- [x] Lock dashboard Direction A as the concrete visual and responsive reference.
- [x] Scaffold Next.js, TypeScript, linting, formatting, tests, and environment validation.
- [x] Define Drizzle tables, enums, relationships, constraints, indexes, and repeatable migrations.
- [x] Add a repeatable development seed that resets the database to one administrator and no operational records.
- [x] Configure Auth.js credentials login, password hashing, sessions, route protection, and centralized role policy.
- [x] Build the responsive application shell and operational dashboard with live database queries.
- [x] Add loading, empty, error, focus, keyboard, and reduced-motion states for the completed slice.
- [x] Complete visual browser inspection at 375px, 768px, and 1280px with no page overflow or browser console errors.
- [x] Verify domain constraints, permission behavior, authenticated rendering, dependency advisories, and the production build.

### Slice 2 — Reservations

- [x] Add searchable, status-filtered, paginated reservation results.
- [x] Provide desktop table and mobile card presentations with full-record navigation.
- [x] Add reservation creation with guest selection, room assignment, stay dates, and notes.
- [x] Add detail and edit flows, including room reassignment for confirmed stays.
- [x] Add authorized check-in, check-out, and cancellation actions with validated status transitions.
- [x] Mark a room dirty during check-out in the same database transaction.
- [x] Return actionable overlap and room-readiness errors while retaining database-level concurrency protection.
- [x] Add reservation input tests and complete lint, type-check, test, and production-build verification.

### Slice 3 — Room Availability Calendar

- [x] Add validated URL state for start date, 7/14/30-day window, floor, and room-status filters.
- [x] Add authorized, range-bounded room and reservation queries using half-open date semantics.
- [x] Build the desktop and tablet CSS timeline with sticky room/date headers and floor grouping.
- [x] Add labeled confirmed, checked-in, and historical checked-out reservation blocks.
- [x] Add non-color maintenance/out-of-order treatment and disable unavailable booking cells.
- [x] Build a separate selected-day mobile room list with 44px controls and bottom-navigation support.
- [x] Add previous/next, Today, date jump, view toggle, filter, and keyboard navigation controls.
- [x] Link existing stays to reservation details and available dates to a prefilled reservation form.
- [x] Add calendar loading and filtered-empty states.
- [x] Verify the calendar visually at 375px, 768px, and 1280px with no browser console errors.

### Slice 4 — Guest Management

- [x] Add case-insensitive guest ID uniqueness and normalized name-plus-phone duplicate protection.
- [x] Add validated and normalized guest identity, contact, and notes inputs.
- [x] Build the searchable, paginated guest directory with derived stay totals and last-stay dates.
- [x] Provide a compact desktop table and dedicated mobile guest records.
- [x] Add authorized guest creation with actionable duplicate links.
- [x] Add guest profiles with contact information, internal notes, and reservation history.
- [x] Add transaction-safe guest editing and preserve reservation associations.
- [x] Prefill a new reservation with the selected guest from their profile.
- [x] Add guest loading, no-record, and no-search-result states.
- [x] Verify guest workflows visually at 375px, 768px, and 1280px with no browser console errors.

### Slice 5 — Housekeeping

- [x] Add authorized room-status board queries with checked-in guest context.
- [x] Group room controls by floor with counts for All, Dirty, Maintenance, and Out-of-order filters.
- [x] Add independently authorized and validated room-status server actions.
- [x] Lock room rows and block Maintenance or Out of order while a guest is checked in.
- [x] Revalidate the housekeeping board, dashboard, and calendar after every successful update.
- [x] Add explicit success and safety-error feedback within the affected room card.
- [x] Build wrapping desktop/tablet grids and a single-column mobile workflow with sticky floor context.
- [x] Add housekeeping loading and filtered-empty states.
- [x] Verify a safe status round-trip and occupied-room rejection against local PostgreSQL.
- [x] Verify housekeeping at 375px, 768px, and 1280px with no browser console errors.

### Slice 6 — Administrator Settings

- [x] Restrict all settings reads and writes to administrators through centralized permissions.
- [x] Add validated room-type creation, editing, and dependency-aware deletion.
- [x] Add room inventory creation, editing, and history-preserving deletion safeguards.
- [x] Add transactional bulk room-status changes with occupied-room maintenance protection.
- [x] Add staff account creation and editing with role selection and bcrypt password hashing.
- [x] Invalidate existing staff sessions after password or role changes.
- [x] Protect the current account and final administrator from unsafe deletion or demotion.
- [x] Build URL-addressable Room types, Rooms, and Staff tabs with dedicated create/edit routes.
- [x] Add desktop tables, mobile records, touch-sized controls, loading, empty, success, and error states.
- [x] Keep all six administrator destinations available in the mobile navigation.
- [x] Verify bulk room updates and responsive layouts at 375px, 768px, and 1280px with no browser errors.

## Validation

- Run unit tests for reservation ranges, status transitions, and authorization policy.
- Run integration tests against PostgreSQL for overlap protection, seed repeatability, and dashboard queries.
- Check keyboard navigation and automated accessibility results on login and dashboard.
- Inspect the dashboard at 375px, 768px, and 1280px and correct composition defects.
- Run lint, type checking, tests, and a production build before handoff.

## Decision Log

| Topic | Decision | Reason |
|---|---|---|
| Delivery | Vertical slices | Produces an early end-to-end operational result and exposes integration risk quickly. |
| Architecture | Modular Next.js monolith | Fits the team size and scale without unnecessary service boundaries. |
| Persistence | PostgreSQL with Drizzle | Provides relational constraints, range exclusion support, and SQL-first type safety. |
| Booking codes | Dedicated database sequence | Guarantees concurrency-safe human-readable codes. |
| Date model | Half-open `[check-in, check-out)` ranges | Supports same-day room turnaround without false overlap. |
| Overlap safety | Database exclusion constraint plus typed application validation | Prevents race-condition double-booking while preserving actionable errors. |
| Calendar v1 | Click-based creation and edits | Keeps validation explicit; drag resizing remains out of scope. |
| Secrets | Ignored local environment file | Prevents credentials from entering source control or documentation. |
| UI register | Restrained product interface | Keeps operational state and action hierarchy clear during busy shifts. |
| Dashboard direction | Direction A: balanced operational overview | Preserves the approved wireframe hierarchy while providing a coherent desktop/mobile system. |
| Authentication session | Auth.js encrypted JWT plus database `session_version` | Credentials providers are incompatible with Auth.js database sessions; the version check retains immediate revocation. |

## Open Questions

None blocking. Deployment provider and production database vendor can be selected after the local vertical slice is verified.

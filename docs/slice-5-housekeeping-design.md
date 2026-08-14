# Slice 5 — Housekeeping Room-Status Board

## Understanding Summary

- Build `/dashboard/housekeeping` for housekeeping, front-desk, and administrator roles.
- Group all rooms by floor and make their current readiness immediately scannable.
- Allow authorized staff to set Clean, Dirty, Maintenance, or Out of order.
- Prevent Maintenance or Out of order while a guest is checked in.
- Show occupancy context so staff understand why a status change may be blocked.
- Provide All, Dirty, Maintenance, and Out-of-order operational filters.
- Keep room creation, editing, deletion, and bulk changes in the later Settings slice.

## Assumptions

- The board handles up to 100 rooms and is read frequently during active shifts.
- Status updates must appear immediately on the board, dashboard, and calendar.
- Every mutation independently authenticates, authorizes, validates input, and rereads trusted room state.
- Check-in and room-status transactions lock the room row, making PostgreSQL the concurrency boundary.
- Mobile users need a single-column, floor-grouped workflow with sticky floor context.
- The current room and reservation schema is sufficient; no migration is required.

## Final Design

The page is server-rendered and URL-filtered. A bounded query returns rooms, room types, and any checked-in guest, while a grouped count query supplies filter totals. Room cards are the primary affordance because each room is a discrete operational object with one status control. Cards use semantic status badges and explicit occupancy text rather than color alone.

Each card contains a native status select and an explicit Update button. This prevents accidental writes from merely browsing the dropdown and preserves keyboard and touch accessibility. The action locks the room, validates the requested state, checks current occupancy for maintenance-related states, updates the room, and revalidates the housekeeping board, dashboard, and calendar in one response.

Desktop uses a wrapping room grid grouped by floor. Tablet reduces the number of columns. Mobile becomes one column with sticky floor headings and controls that retain 44px touch targets. Expected safety failures stay inside the affected room card and explain the corrective action.

## Decision Log

| Decision | Alternatives | Reason |
|---|---|---|
| Explicit Update button | Auto-submit on selection | Reduces accidental operational status changes. |
| Native select control | Custom dropdown | Preserves familiar keyboard, touch, and accessibility behavior. |
| Occupancy shown on every card | Only show it on failures | Gives staff context before attempting a blocked change. |
| Room-row locking | Application-only precheck | Protects against simultaneous check-in and maintenance changes. |
| No bulk actions | Multi-select status update | Bulk room administration belongs to Settings and needs separate safeguards. |

## Verification Strategy

- Unit-test occupied-room transition rules.
- Verify role access and input validation.
- Verify a safe status round-trip and an occupied maintenance rejection against PostgreSQL.
- Exercise filters and feedback in the authenticated app.
- Inspect 375px, 768px, and 1280px layouts with console-error checks.
- Run the UI-quality detector, lint, type checking, tests, production build, and offline audit.


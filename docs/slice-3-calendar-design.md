# Slice 3 — Room Availability Calendar

## Understanding Summary

- Build `/dashboard/calendar` for front-desk staff and administrators.
- Show rooms grouped by floor across selectable 7, 14, or 30-day windows.
- Preserve room and date context with sticky headers and a clear today indicator.
- Open existing reservation details from occupied calendar ranges.
- Start the existing reservation workflow with room and dates prefilled from available dates.
- Replace the desktop timeline with a selected-day room list on mobile.
- Keep drag-to-resize outside this slice so all mutations retain the validated Slice 2 workflow.

## Assumptions

- The hotel operates up to 100 rooms with 5–15 concurrent staff.
- Desktop and tablet are primary; mobile supports focused availability checks and reservation entry.
- URL state is appropriate for date range, view length, floor, and room-status filters.
- Existing reservation permissions, overlap constraints, and half-open date semantics remain authoritative.
- The current schema contains everything required; Slice 3 needs no database migration.
- Target accessibility is WCAG 2.1 AA with keyboard operation and 44px mobile touch targets.

## Final Design

The calendar uses a server-rendered page as its data and authorization boundary. Validated URL parameters control the start date, 7/14/30-day window, floor filter, and room-status filter. Its query retrieves rooms, room types, and only active reservations that intersect the visible half-open date range. Cancelled reservations do not occupy the timeline.

Desktop and tablet use a horizontally scrollable CSS timeline with sticky date headers and room labels. Rooms are grouped by floor. Today has a subtle semantic highlight. Maintenance and out-of-order rooms include a non-color visual pattern and explicit status text. Confirmed and checked-in stays use distinct labeled blocks.

Mobile switches to a selected-day list. Each room row shows availability, room type, readiness, and any intersecting reservation. Previous-day, next-day, and Today controls retain the active filters.

Selecting an existing stay opens its current reservation detail route. Selecting an available date opens the existing reservation creation route with the room, check-in date, and following day prefilled. Keyboard shortcuts support previous/next date and Today when focus is not inside a form control.

Invalid dates and filters fall back to safe defaults. Empty results explain how to clear filters. Narrow blocks and long guest names truncate visually while preserving accessible labels and focus details.

## Verification Strategy

- Unit-test date-window validation and half-open intersection behavior.
- Verify cancelled reservations are excluded from occupied ranges.
- Verify calendar authorization for each staff role.
- Exercise reservation-detail and prefilled-creation links against local PostgreSQL data.
- Check desktop/tablet timeline and mobile day-list structures.
- Check keyboard navigation, focus states, touch targets, and reduced motion.
- Run lint, type checking, tests, production build, authenticated rendering, and the UI-quality detector.

## Decision Log

| Decision | Alternatives | Reason |
|---|---|---|
| URL-driven hybrid calendar | Fully server-rendered; fully client-managed | Preserves reliable server data and shareable state while supporting keyboard navigation. |
| Existing reservation routes | Calendar modal and detail drawer | Avoids duplicated mutation state and keeps Slice 2 validation authoritative. |
| Selected-day mobile list | Compressed horizontal timeline | Preserves readability and touch usability on narrow screens. |
| Read-only timeline manipulation | Drag-to-resize stays | Keeps overlap validation explicit and avoids ambiguous high-risk edits. |
| 14-day default with 7/30 toggles | One fixed window | Balances operational visibility with user-controlled density. |


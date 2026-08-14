# Design: Status Kamar & Kasur Page (Slice 7)

## Purpose
Provide a visual, card-based overview of all rooms and their beds on a selected date, allowing front-desk staff to easily see who occupies each room and bed without manual searching.

---

## 1. Understanding Summary
* **What**: A new page `/dashboard/rooms` displaying room cards with beds and occupancy status.
* **Why**: Saves time for front-desk staff by showing occupancy layouts directly, enabling fast check-ins/check-outs and visual occupancy audits.
* **Who**: Front-desk staff and administrators.
* **Key constraints**:
  * Grouped by Room (Kamar).
  * Selectable date (defaults to today).
  * Filterable by Guest Name, Room Name, or Location Name.
  * Click to view reservation or start booking.
  * Calm, neutral styling (light slate theme, no decorative gradients).

---

## 2. Assumptions & NFRs
* **Permissions**: Access is guarded by the `calendar:view` permission (granted to `ADMIN` and `FRONT_DESK`).
* **Scale**: Fits the typical boutique hostel size (up to 100 rooms/beds). Performance target is page render/load in `< 300ms`.
* **Date Definition**: A bed is occupied on `date` if a reservation with status `CONFIRMED`, `CHECKED_IN`, or `CHECKED_OUT` spans the night of `date`.

---

## 3. Decision Log
* **Room Card Grid**: Selected a room-grouped grid of cards rather than a flat table to model the physical layout of the hostel.
* **Dynamic Date Navigation**: Selected dynamic date selection (date picker + forward/backward buttons) to allow looking ahead/behind.

---

## 4. Proposed Implementation Detail

### Database Query
Fetch rooms and their associated beds, along with active reservations for the selected date.

```typescript
// src/modules/rooms/queries.ts
import { and, eq, inArray, lt, gt } from "drizzle-orm";
import { db } from "@/db/client";
import { rooms, beds, locations, reservations, guests } from "@/db/schema";

export async function getRoomsStatusData(date: string) {
  // Query all beds and rooms
  const allBeds = await db
    .select({
      bedId: beds.id,
      bedNumber: beds.bedNumber,
      bedStatus: beds.status,
      roomId: rooms.id,
      roomName: rooms.name,
      locationName: locations.name,
      isMixedGender: rooms.isMixedGender,
    })
    .from(beds)
    .innerJoin(rooms, eq(beds.roomId, rooms.id))
    .leftJoin(locations, eq(rooms.locationId, locations.id))
    .orderBy(locations.name, rooms.name, beds.bedNumber);

  // Query reservations active on this specific date
  const activeReservations = await db
    .select({
      reservationId: reservations.id,
      bedId: reservations.bedId,
      bookingCode: reservations.bookingCode,
      status: reservations.status,
      guestName: guests.fullName,
    })
    .from(reservations)
    .innerJoin(guests, eq(reservations.guestId, guests.id))
    .where(
      and(
        inArray(reservations.status, ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"]),
        lt(reservations.checkInDate, date + "T23:59:59Z"), // Active on the given night
        gt(reservations.checkOutDate, date)
      )
    );

  return { allBeds, activeReservations };
}
```

### Components & Pages
1. **`src/app/dashboard/rooms/page.tsx`**: Renders the room grid, processes search inputs, and coordinates server-side querying.
2. **`src/app/dashboard/rooms/rooms-controls.tsx`**: Renders search bar, date selection input, and navigation buttons.
3. **`src/app/dashboard/rooms/rooms.module.css`**: Styles cards in a responsive auto-fit grid aligning with `DESIGN.md`.

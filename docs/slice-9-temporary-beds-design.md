# Design Specification: Temporary Bed Management (Kasur Sementara)

This document details the architecture, database changes, and validation logic for implementing temporary beds (Kasur Sementara) with manual active/inactive lifecycle controls.

## 1. Problem Statement & Context
Hotels and hostels frequently add temporary beds (e.g., rollaway beds, extra cots) to rooms to accommodate high occupancy or group bookings.
- Currently, all beds in a room are treated as permanent, active parts of the hotel inventory.
- Deleting a bed that has historical bookings breaks database referential integrity (`{ onDelete: "restrict" }` constraints).
- Marking a bed as inactive must be operationally safe (not leaving active/upcoming guests assigned to a physically decommissioned bed).

## 2. Proposed Solution (Design Approach A)
Add dedicated `isTemporary` and `isActive` fields to the `beds` schema to decouple physical maintenance state (`status` like `CLEAN`/`DIRTY`) from the business lifecycle status (`isActive` like active/deactivated).

---

## 3. Detailed Technical Design

### A. Database Schema Updates (`src/db/schema.ts`)
Add two columns to the `beds` table:
- `isTemporary`: boolean, defaults to `false`.
- `isActive`: boolean, defaults to `true`.

```typescript
export const beds = pgTable(
  "beds",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bedNumber: text("bed_number").notNull(),
    roomId: uuid("room_id")
      .notNull()
      .references(() => rooms.id, { onDelete: "restrict" }),
    status: roomStatus("status").notNull().default("CLEAN"),
    isTemporary: boolean("is_temporary").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  // ... indexes
);
```

### B. Input Validation (`src/modules/settings/validation.ts`)
Extend `roomInputSchema` and `roomInputFromForm` to parse and validate `isTemporary` and `isActive` flags:

```typescript
export const roomInputSchema = z.object({
  bedNumber: z.string().trim().min(1, "Masukkan nomor kasur.").max(12, "Nomor kasur harus 12 karakter atau kurang.").regex(/^[A-Za-z0-9-]+$/, "Gunakan huruf, angka, atau tanda hubung saja.").transform((value) => value.toUpperCase()),
  roomId: z.string().uuid("Pilih kamar."),
  status: z.enum(["CLEAN", "DIRTY", "MAINTENANCE", "OUT_OF_ORDER"]),
  isTemporary: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export function roomInputFromForm(formData: FormData) {
  const isTemp = formData.get("isTemporary") === "on" || formData.get("isTemporary") === "true";
  const isAct = formData.get("isActive") === "on" || formData.get("isActive") === "true";

  return roomInputSchema.safeParse({
    bedNumber: formData.get("roomNumber"),
    roomId: formData.get("roomTypeId"),
    status: formData.get("status"),
    isTemporary: isTemp,
    isActive: isAct,
  });
}
```

### C. Server-Side Deactivation Guard (`src/app/dashboard/settings/actions.ts`)
Within `updateRoomAction` (where beds are updated), if the bed is being switched from active to inactive (`isActive` changes from `true` to `false`), query the `reservations` table to block deactivation if any uncompleted (`CONFIRMED` or `CHECKED_IN`) bookings remain assigned:

```typescript
if (current.isActive && !parsed.data.isActive) {
  const [activeBookings] = await tx
    .select({ value: count() })
    .from(reservations)
    .where(
      and(
        eq(reservations.bedId, id),
        inArray(reservations.status, ["CONFIRMED", "CHECKED_IN"])
      )
    );

  if (activeBookings && activeBookings.value > 0) {
    return {
      status: "error",
      message: `Kasur tidak dapat dinonaktifkan karena memiliki ${activeBookings.value} reservasi aktif atau mendatang. Harap pindahkan reservasi tersebut terlebih dahulu.`
    };
  }
}
```

### D. Form Layout & Dropdown Presentation
1. **`RoomForm` (`src/app/dashboard/settings/settings-forms.tsx`):**
   Render two checkboxes: "Kasur Sementara" and "Aktif (Dapat Dipesan)".
2. **`ReservationForm` (`src/app/dashboard/reservations/reservation-form.tsx`):**
   - Query `isTemporary` and `isActive` fields inside `getReservationOptions`.
   - Filter `availableRooms` to only include beds where `isActive` is `true` (or the currently selected bed to prevent edit overrides).
   - Display a `(Sementara)` suffix for temporary beds in the grouped options selection.

### E. Calendar Conditional Visibility (`src/modules/calendar/queries.ts`)
Select all active beds, plus any inactive beds that have reservations intersecting the calendar window dates, ensuring historical timeline data is preserved:

```typescript
  const activeOrBookedCondition = or(
    eq(beds.isActive, true),
    exists(
      db
        .select()
        .from(reservations)
        .where(
          and(
            eq(reservations.bedId, beds.id),
            inArray(reservations.status, ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"]),
            lt(reservations.checkInDate, window.endExclusive),
            gt(reservations.checkOutDate, window.start)
          )
        )
    )
  );
```

### F. Dashboard Metric Filters (`src/modules/dashboard/queries.ts`)
Only count or list active beds (`isActive = true`) for total capacity, dirtiness count, and housekeeping attention logs.

---

## 4. Decision Log & Rationale
1. **Decision:** Dedicated `isTemporary` and `isActive` Boolean Columns.
   - *Rationale:* Decouples physical cleaning/maintenance state from structural room active/inactive lifecycle states.
2. **Decision:** Conditional Calendar Visibility.
   - *Rationale:* Preserves past booking timeline integrity on historical grid reports while keeping future dates clean of deactivated beds.
3. **Decision:** Strict Deactivation Blocking.
   - *Rationale:* Prevents orphaned or impossible reservations where check-in dates exist on physically decommissioned beds.

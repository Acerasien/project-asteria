# Design: Bulk Bed Generation (Slice 8)

## Purpose
Simplify adding beds (Kasur) to a room (Kamar) by allowing administrators to auto-generate multiple sequential beds when creating a room, instead of adding them one-by-one.

---

## 1. Understanding Summary
* **What**: An enhancement to the Room creation form to input a bed count and name prefix.
* **Why**: Prevents tedious manual entries of beds in multi-bed hostel rooms.
* **Who**: Administrators.
* **Key constraints**:
  * **Creation Only**: Beds are only generated on initial Room creation.
  * **Naming Format**: Prefix + sequential numbers (e.g. "Kasur 1", "Kasur 2"). Default prefix is "Kasur".
  * **Length Limits**: Since bed numbers are capped at 12 characters, the prefix is limited to a maximum of 9 characters (allowing room for suffix up to " 50").
  * **Quantity limits**: Max 50 beds per room.

---

## 2. Assumptions & NFRs
* **Permissions**: Guarded by `rooms:manage` permission.
* **Database Consistency**: Grouped in a single transaction. Any name collisions or errors trigger a rollback.
* **Status**: Automatically generated beds default to `CLEAN`.

---

## 3. Decision Log
* **Approach**: Count + Prefix input in the Room form rather than interactive dynamic form rows.
* **Creation-Only Constraint**: Prevents accidental data deletion on rooms updates.

---

## 4. Proposed Implementation Detail

### Zod Validation
```typescript
// src/modules/settings/validation.ts
export const roomTypeCreateInputSchema = roomTypeInputSchema.extend({
  bedCount: z.coerce
    .number()
    .int()
    .min(1, "Jumlah kasur minimal 1.")
    .max(50, "Jumlah kasur maksimal 50.")
    .optional()
    .nullable(),
  bedPrefix: z.string()
    .trim()
    .max(9, "Prefiks nama kasur maksimal 9 karakter.")
    .default("Kasur")
    .optional()
    .nullable(),
});
```

### Server Action
```typescript
// src/app/dashboard/settings/actions.ts
export async function createRoomTypeAction(_state: SettingsActionState, formData: FormData): Promise<SettingsActionState> {
  await verifySession("rooms:manage");
  const parsed = roomTypeInputFromForm(formData, true); // True triggers create schema
  if (!parsed.success) return validationState(parsed.error);
  
  let id: string;
  try {
    const { name, locationId, isMixedGender, description, bedCount, bedPrefix } = parsed.data;
    await db.transaction(async (tx) => {
      const [created] = await tx.insert(rooms).values({ name, locationId, isMixedGender, description }).returning({ id: rooms.id });
      if (!created) throw new Error("ROOM_CREATION_FAILED");
      id = created.id;
      
      if (bedCount && bedCount > 0) {
        const prefix = bedPrefix || "Kasur";
        const bedsToInsert = Array.from({ length: bedCount }, (_, i) => ({
          roomId: id,
          bedNumber: `${prefix} ${i + 1}`,
          status: "CLEAN" as const,
        }));
        await tx.insert(beds).values(bedsToInsert);
      }
    });
  } catch (error) {
    return { status: "error", message: uniqueMessage(error, "room type") };
  }
  revalidateOperations();
  redirect(`/dashboard/settings/room-types/${id}?created=1`);
}
```

"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { RoomStatus } from "@/db/schema";
import { updateRoomStatusAction, type RoomStatusActionState } from "./actions";
import styles from "./housekeeping.module.css";

function UpdateButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending}>{pending ? "Memperbarui…" : "Perbarui"}</button>;
}

export function RoomStatusControl({ roomId, roomNumber, currentStatus }: { roomId: string; roomNumber: string; currentStatus: RoomStatus }) {
  const action = updateRoomStatusAction.bind(null, roomId);
  const [state, formAction] = useActionState(action, { status: "idle" } satisfies RoomStatusActionState);
  return <form action={formAction} className={styles.statusForm}>
    <label><span className={styles.srOnly}>Status baru untuk kamar {roomNumber}</span><select name="status" defaultValue={currentStatus} aria-label={`Status baru untuk kamar ${roomNumber}`}><option value="CLEAN">Bersih</option><option value="DIRTY">Kotor</option><option value="MAINTENANCE">Pemeliharaan</option><option value="OUT_OF_ORDER">Rusak</option></select></label>
    <UpdateButton />
    {state.message ? <p data-status={state.status} role="status">{state.message}</p> : null}
  </form>;
}


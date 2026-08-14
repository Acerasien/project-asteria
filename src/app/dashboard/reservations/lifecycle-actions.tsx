"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { ReservationStatus } from "@/db/schema";
import { transitionReservationAction, type ReservationActionState } from "./actions";
import styles from "./reservations.module.css";

function ActionButton({ children, danger = false }: { children: React.ReactNode; danger?: boolean }) {
  const { pending } = useFormStatus();
  return <button type="submit" className={danger ? styles.dangerButton : styles.primaryButton} disabled={pending}>{pending ? "Memproses…" : children}</button>;
}

function TransitionForm({ id, target, children, danger }: { id: string; target: ReservationStatus; children: React.ReactNode; danger?: boolean }) {
  const action = transitionReservationAction.bind(null, id, target);
  const [state, formAction] = useActionState(action, { status: "idle" } satisfies ReservationActionState);
  return (
    <form
      action={formAction}
      className={styles.transitionForm}
      onSubmit={danger ? (event) => { if (!window.confirm("Batalkan reservasi ini? Tindakan ini tidak dapat dibatalkan.")) event.preventDefault(); } : undefined}
    >
      {target === "CHECKED_IN" ? <label className={styles.override}><input type="checkbox" name="forceRoom" />Izinkan check-in jika kamar tidak bersih</label> : null}
      <ActionButton danger={danger}>{children}</ActionButton>
      {state.message ? <p className={styles.actionMessage} data-status={state.status} role="status">{state.message}</p> : null}
    </form>
  );
}

export function LifecycleActions({ id, status }: { id: string; status: ReservationStatus }) {
  if (status === "CHECKED_OUT" || status === "CANCELLED") return <p className={styles.terminalNote}>Tidak ada tindakan lebih lanjut yang tersedia untuk reservasi ini.</p>;
  return (
    <div className={styles.lifecycleActions}>
      {status === "CONFIRMED" ? <TransitionForm id={id} target="CHECKED_IN">Check-in tamu</TransitionForm> : null}
      {status === "CHECKED_IN" ? <TransitionForm id={id} target="CHECKED_OUT">Check-out tamu</TransitionForm> : null}
      <TransitionForm id={id} target="CANCELLED" danger>Batalkan reservasi</TransitionForm>
    </div>
  );
}


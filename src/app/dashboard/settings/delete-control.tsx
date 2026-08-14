"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { SettingsActionState } from "./actions";
import styles from "./settings.module.css";

import { Trash2 } from "lucide-react";

function DeleteButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <button className={styles.dangerButton} type="submit" disabled={pending}>
    <Trash2 size={16} aria-hidden="true" />
    <span>{pending ? "Menghapus…" : label}</span>
  </button>;
}

export function DeleteControl({ action, label, confirmMessage }: { action: (state: SettingsActionState, formData: FormData) => Promise<SettingsActionState>; label: string; confirmMessage: string }) {
  const [state, formAction] = useActionState(action, { status: "idle" } satisfies SettingsActionState);
  return <form action={formAction} className={styles.deleteForm} onSubmit={(event) => { if (!window.confirm(confirmMessage)) event.preventDefault(); }}>
    <DeleteButton label={label} />
    {state.message ? <p data-status={state.status} role="alert">{state.message}</p> : null}
  </form>;
}

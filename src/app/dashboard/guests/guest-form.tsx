"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { GuestActionState } from "./actions";
import styles from "./guests.module.css";

type GuestDefaults = { fullName?: string; gender?: "MALE" | "FEMALE"; phone?: string; email?: string | null; idNumber?: string; notes?: string | null };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <button className={styles.primaryButton} type="submit" disabled={pending}>{pending ? "Menyimpan…" : label}</button>;
}

export function GuestForm({ action, deleteAction, defaults = {}, submitLabel, cancelHref }: {
  action: (state: GuestActionState, formData: FormData) => Promise<GuestActionState>;
  deleteAction?: (state: GuestActionState, formData: FormData) => Promise<GuestActionState>;
  defaults?: GuestDefaults;
  submitLabel: string;
  cancelHref: string;
}) {
  const [state, formAction] = useActionState(action, { status: "idle" } satisfies GuestActionState);
  const [deleteState, deleteFormAction] = useActionState(
    deleteAction || (() => Promise.resolve({ status: "idle" as const } satisfies GuestActionState)),
    { status: "idle" } satisfies GuestActionState
  );
  const error = (field: string) => state.fieldErrors?.[field]?.[0];

  return (
    <div>
      {state.message ? (
        <div className={styles.formMessage} data-status={state.status} role="alert">
          {state.message}
          {state.duplicateId ? (
            <>
              {" "}
              <Link href={`/dashboard/guests/${state.duplicateId}`}>Lihat tamu yang ada</Link>
            </>
          ) : null}
        </div>
      ) : null}

      {deleteState.message ? (
        <div className={styles.formMessage} data-status={deleteState.status} role="alert" style={{ marginBottom: "1rem" }}>
          {deleteState.message}
        </div>
      ) : null}

      <form action={formAction} className={styles.form}>
        <div className={styles.formGrid}>
          <label className={styles.field}><span>Nama lengkap</span><input name="fullName" autoComplete="name" maxLength={120} defaultValue={defaults.fullName} aria-invalid={Boolean(error("fullName"))} required />{error("fullName") ? <small>{error("fullName")}</small> : null}</label>
          <label className={styles.field}><span>Jenis Kelamin</span><select name="gender" defaultValue={defaults.gender ?? ""} aria-invalid={Boolean(error("gender"))} required><option value="" disabled>Pilih jenis kelamin</option><option value="MALE">Laki - Laki</option><option value="FEMALE">Perempuan</option></select>{error("gender") ? <small>{error("gender")}</small> : null}</label>
          <label className={styles.field}><span>Telepon</span><input name="phone" type="tel" autoComplete="tel" maxLength={32} defaultValue={defaults.phone} aria-invalid={Boolean(error("phone"))} placeholder="+62 812 555 0199" required />{error("phone") ? <small>{error("phone")}</small> : null}</label>
          <label className={styles.field}><span>Email <em>Opsional</em></span><input name="email" type="email" autoComplete="email" maxLength={254} defaultValue={defaults.email ?? ""} aria-invalid={Boolean(error("email"))} placeholder="tamu@example.com" />{error("email") ? <small>{error("email")}</small> : null}</label>
          <label className={styles.field}><span>Paspor atau KTP</span><input name="idNumber" autoComplete="off" maxLength={64} defaultValue={defaults.idNumber} aria-invalid={Boolean(error("idNumber"))} required />{error("idNumber") ? <small>{error("idNumber")}</small> : null}</label>
        </div>
        <label className={styles.field}><span>Catatan internal <em>Opsional</em></span><textarea name="notes" rows={5} maxLength={2000} defaultValue={defaults.notes ?? ""} placeholder="Preferensi atau informasi yang berguna selama kunjungan di masa depan" />{error("notes") ? <small>{error("notes")}</small> : null}</label>
        <div className={styles.formActions}>
          {deleteAction && (
            <button
              formAction={deleteFormAction}
              className={styles.dangerButton}
              onClick={(e) => {
                if (!confirm("Apakah Anda yakin ingin menghapus tamu ini? Tindakan ini tidak dapat dibatalkan.")) {
                  e.preventDefault();
                }
              }}
              style={{ marginRight: "auto" }}
            >
              Hapus Tamu
            </button>
          )}
          <Link className={styles.secondaryButton} href={cancelHref}>Batal</Link>
          <SubmitButton label={submitLabel} />
        </div>
      </form>
    </div>
  );
}

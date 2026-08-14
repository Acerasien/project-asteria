"use client";

import { useActionState, startTransition } from "react";
import { wipeDatabaseAction, type SettingsActionState } from "./actions";
import styles from "./settings.module.css";

export function WipeDatabaseZone() {
  const [state, formAction, isPending] = useActionState(
    wipeDatabaseAction,
    { status: "idle" } satisfies SettingsActionState
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const confirmed = window.confirm(
      "Apakah Anda YAKIN ingin membersihkan seluruh isi database?\n\n" +
      "Tindakan ini akan menghapus permanen semua data:\n" +
      "- Reservasi\n" +
      "- Tamu\n" +
      "- Kasur\n" +
      "- Kamar\n" +
      "- Lokasi\n" +
      "- Akun staf non-admin\n\n" +
      "Tindakan ini TIDAK dapat dibatalkan!"
    );

    if (confirmed) {
      const formData = new FormData(e.currentTarget);
      startTransition(() => {
        formAction(formData);
      });
    }
  };

  return (
    <div className={styles.dangerPanel} style={{ flexDirection: "column", alignItems: "stretch" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2>Zona Bahaya: Bersihkan Database</h2>
          <p>
            Hapus semua data reservasi, tamu, kasur, kamar, lokasi, dan akun staf non-admin. 
            Data login Administrator saat ini akan tetap dipertahankan.
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <button
            type="submit"
            className={styles.dangerButton}
            style={{ color: "var(--color-maintenance)", borderColor: "var(--color-maintenance)" }}
            disabled={isPending}
          >
            {isPending ? "Membersihkan…" : "Bersihkan Database"}
          </button>
        </form>
      </div>

      {state.message ? (
        <div 
          className={styles.inlineMessage} 
          data-status={state.status} 
          style={{ marginTop: "1rem", borderRadius: "var(--radius-sm)" }}
        >
          {state.message}
        </div>
      ) : null}
    </div>
  );
}

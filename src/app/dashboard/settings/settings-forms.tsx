"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import type { RoomStatus } from "@/db/schema";
import type { StaffRole } from "@/lib/permissions";
import type { SettingsActionState } from "./actions";
import styles from "./settings.module.css";

type FormAction = (state: SettingsActionState, formData: FormData) => Promise<SettingsActionState>;

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <button className={styles.primaryButton} type="submit" disabled={pending}>{pending ? "Menyimpan…" : label}</button>;
}

export function RoomTypeForm({
  action,
  locations,
  defaults = {},
  submitLabel,
}: {
  action: FormAction;
  locations: { id: string; name: string }[];
  defaults?: { name?: string; locationId?: string | null; isMixedGender?: boolean; description?: string | null };
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(action, { status: "idle" } satisfies SettingsActionState);
  const error = (field: string) => state.fieldErrors?.[field]?.[0];

  return <form action={formAction} className={styles.form}>
    {state.message ? <div className={styles.formMessage} data-status={state.status} role="alert">{state.message}</div> : null}
    
    <div className={styles.sectionHeader}>
      <h2>Informasi dasar</h2>
      <p>Atur nama, kapasitas, dan informasi untuk tim operasional.</p>
    </div>
    <hr className={styles.divider} />

    <div className={styles.formFields}>
      <div className={styles.field}>
        <div className={styles.fieldLabelRow}>
          <span>Nama kamar</span>
        </div>
        <input name="name" maxLength={80} defaultValue={defaults.name} aria-invalid={Boolean(error("name"))} required />
        {error("name") ? <small className={styles.fieldError}>{error("name")}</small> : null}
      </div>

      <div className={styles.field}>
        <div className={styles.fieldLabelRow}>
          <span>Lokasi</span>
          <em>Opsional</em>
        </div>
        <select name="locationId" defaultValue={defaults.locationId ?? ""} aria-invalid={Boolean(error("locationId"))}>
          <option value="">Tanpa Lokasi</option>
          {locations.map((loc) => <option value={loc.id} key={loc.id}>{loc.name}</option>)}
        </select>
        <p className={styles.fieldHelper}>Lokasi kamar di dalam properti.</p>
        {error("locationId") ? <small className={styles.fieldError}>{error("locationId")}</small> : null}
      </div>

      <div className={styles.checkboxField}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            name="isMixedGender"
            defaultChecked={defaults.isMixedGender ?? false}
          />
          <div>
            <strong>Bisa Campur (Campur Gender)</strong>
            <p className={styles.fieldHelper}>
              Jika dicentang, kamar ini dapat diisi oleh tamu laki-laki dan perempuan secara bersamaan tanpa mengunci gender kamar.
            </p>
          </div>
        </label>
        {error("isMixedGender") ? <small className={styles.fieldError}>{error("isMixedGender")}</small> : null}
      </div>

      {!defaults.name ? (
        <>
          <div className={styles.sectionHeader} style={{ marginTop: "var(--space-4)" }}>
            <h2>Pembuat kasur otomatis</h2>
            <p>Buat beberapa kasur secara otomatis untuk kamar baru ini.</p>
          </div>
          <hr className={styles.divider} />

          <div className={styles.field}>
            <div className={styles.fieldLabelRow}>
              <span>Jumlah kasur</span>
              <em>Opsional</em>
            </div>
            <input
              type="number"
              name="bedCount"
              min={1}
              max={50}
              placeholder="Contoh: 4"
              aria-invalid={Boolean(error("bedCount"))}
            />
            <p className={styles.fieldHelper}>Masukkan jumlah kasur (maks. 50) untuk dibuat langsung.</p>
            {error("bedCount") ? <small className={styles.fieldError}>{error("bedCount")}</small> : null}
          </div>

          <div className={styles.field}>
            <div className={styles.fieldLabelRow}>
              <span>Prefiks nama kasur</span>
              <em>Opsional</em>
            </div>
            <input
              type="text"
              name="bedPrefix"
              maxLength={9}
              defaultValue="Kasur"
              placeholder="Contoh: Kasur"
              aria-invalid={Boolean(error("bedPrefix"))}
            />
            <p className={styles.fieldHelper}>Misal: 'Kasur' menghasilkan 'Kasur 1', 'Kasur 2', dst. Maks. 9 karakter.</p>
            {error("bedPrefix") ? <small className={styles.fieldError}>{error("bedPrefix")}</small> : null}
          </div>
        </>
      ) : null}

      <div className={styles.field}>
        <div className={styles.fieldLabelRow}>
          <span>Deskripsi</span>
          <em>Opsional</em>
        </div>
        <textarea
          name="description"
          rows={3}
          maxLength={500}
          defaultValue={defaults.description ?? ""}
          placeholder="Contoh: Kamar khusus tamu perempuan atau mess umum."
          aria-invalid={Boolean(error("description"))}
        />
        <p className={styles.fieldHelper}>Catatan ini hanya digunakan oleh tim operasional.</p>
        {error("description") ? <small className={styles.fieldError}>{error("description")}</small> : null}
      </div>
    </div>

    <div className={styles.formActions}>
      <Link className={styles.secondaryButton} href="/dashboard/settings?tab=room-types">Batal</Link>
      <SubmitButton label={submitLabel} />
    </div>
  </form>;
}

export function RoomForm({ action, roomTypes, defaults = {}, submitLabel }: { action: FormAction; roomTypes: { id: string; name: string }[]; defaults?: { bedNumber?: string; roomId?: string; status?: RoomStatus; isTemporary?: boolean; isActive?: boolean }; submitLabel: string }) {
  const [state, formAction] = useActionState(action, { status: "idle" } satisfies SettingsActionState);
  const error = (field: string) => state.fieldErrors?.[field]?.[0];

  return <form action={formAction} className={styles.form}>
    {state.message ? <div className={styles.formMessage} data-status={state.status} role="alert">{state.message}</div> : null}
    
    <div className={styles.sectionHeader}>
      <h2>Informasi dasar</h2>
      <p>Atur nomor kasur, kamar, dan status operasional.</p>
    </div>
    <hr className={styles.divider} />

    <div className={styles.formFields}>
      <div className={styles.field}>
        <div className={styles.fieldLabelRow}>
          <span>Nomor kasur</span>
        </div>
        <input name="roomNumber" maxLength={12} defaultValue={defaults.bedNumber} aria-invalid={Boolean(error("bedNumber") || error("roomNumber"))} required />
        {(error("bedNumber") || error("roomNumber")) ? <small className={styles.fieldError}>{error("bedNumber") || error("roomNumber")}</small> : null}
      </div>

      <div className={styles.field}>
        <div className={styles.fieldLabelRow}>
          <span>Kamar</span>
        </div>
        <select name="roomTypeId" defaultValue={defaults.roomId ?? ""} aria-invalid={Boolean(error("roomTypeId"))} required>
          <option value="" disabled>Pilih kamar</option>
          {roomTypes.map((type) => <option value={type.id} key={type.id}>{type.name}</option>)}
        </select>
        {error("roomTypeId") ? <small className={styles.fieldError}>{error("roomTypeId")}</small> : null}
      </div>

      <div className={styles.field}>
        <div className={styles.fieldLabelRow}>
          <span>Status operasional</span>
        </div>
        <select name="status" defaultValue={defaults.status ?? "CLEAN"}>
          {statusOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
        </select>
        {error("status") ? <small className={styles.fieldError}>{error("status")}</small> : null}
      </div>

      <div className={styles.checkboxField}>
        <label className={styles.checkboxLabel}>
          <input name="isTemporary" type="checkbox" defaultChecked={defaults.isTemporary} />
          <div>
            <strong>Kasur Sementara</strong>
            <p style={{ margin: "var(--space-1) 0 0", color: "var(--color-ink-secondary)", fontSize: "0.75rem", fontWeight: 450 }}>Kasur ini ditambahkan sementara untuk kapasitas tambahan.</p>
          </div>
        </label>
      </div>

      <div className={styles.checkboxField}>
        <label className={styles.checkboxLabel}>
          <input name="isActive" type="checkbox" defaultChecked={defaults.isActive ?? true} />
          <div>
            <strong>Kasur Aktif</strong>
            <p style={{ margin: "var(--space-1) 0 0", color: "var(--color-ink-secondary)", fontSize: "0.75rem", fontWeight: 450 }}>Kasur dapat dipilih untuk pembuatan reservasi baru.</p>
          </div>
        </label>
      </div>
    </div>

    <p className={styles.fieldHelper}>Kasur yang sedang ditempati tidak dapat diubah ke status pemeliharaan atau rusak.</p>
    
    <div className={styles.formActions}>
      <Link className={styles.secondaryButton} href="/dashboard/settings?tab=rooms">Batal</Link>
      <SubmitButton label={submitLabel} />
    </div>
  </form>;
}

export function StaffForm({ action, defaults = {}, editing = false, submitLabel }: { action: FormAction; defaults?: { name?: string; email?: string; role?: StaffRole }; editing?: boolean; submitLabel: string }) {
  const [state, formAction] = useActionState(action, { status: "idle" } satisfies SettingsActionState);
  const error = (field: string) => state.fieldErrors?.[field]?.[0];

  return <form action={formAction} className={styles.form}>
    {state.message ? <div className={styles.formMessage} data-status={state.status} role="alert">{state.message}</div> : null}
    
    <div className={styles.sectionHeader}>
      <h2>Informasi dasar</h2>
      <p>Atur nama lengkap, email, peran staf, dan kata sandi akses.</p>
    </div>
    <hr className={styles.divider} />

    <div className={styles.formFields}>
      <div className={styles.field}>
        <div className={styles.fieldLabelRow}>
          <span>Nama lengkap</span>
        </div>
        <input name="name" autoComplete="name" maxLength={120} defaultValue={defaults.name} aria-invalid={Boolean(error("name"))} required />
        {error("name") ? <small className={styles.fieldError}>{error("name")}</small> : null}
      </div>

      <div className={styles.field}>
        <div className={styles.fieldLabelRow}>
          <span>Email</span>
        </div>
        <input name="email" type="email" autoComplete="email" maxLength={254} defaultValue={defaults.email} aria-invalid={Boolean(error("email"))} required />
        {error("email") ? <small className={styles.fieldError}>{error("email")}</small> : null}
      </div>

      <div className={styles.field}>
        <div className={styles.fieldLabelRow}>
          <span>Peran</span>
        </div>
        <select name="role" defaultValue={defaults.role ?? "FRONT_DESK"}>
          {roleOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
        </select>
        {error("role") ? <small className={styles.fieldError}>{error("role")}</small> : null}
      </div>

      <div className={styles.field}>
        <div className={styles.fieldLabelRow}>
          <span>{editing ? "Kata sandi baru" : "Kata sandi sementara"}</span>
          {editing && <em>Opsional</em>}
        </div>
        <input name="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} aria-invalid={Boolean(error("password"))} required={!editing} />
        <p className={styles.fieldHelper}>{editing ? "Biarkan kosong untuk mempertahankan kata sandi saat ini." : "Minimal 8 karakter."}</p>
        {error("password") ? <small className={styles.fieldError}>{error("password")}</small> : null}
      </div>
    </div>

    <p className={styles.fieldHelper}>Mengubah peran atau kata sandi akan mengeluarkan anggota staf dari sesi aktif mereka.</p>
    
    <div className={styles.formActions}>
      <Link className={styles.secondaryButton} href="/dashboard/settings?tab=staff">Batal</Link>
      <SubmitButton label={submitLabel} />
    </div>
  </form>;
}

export function LocationForm({ action, defaults = {}, submitLabel }: { action: FormAction; defaults?: { name?: string; description?: string | null }; submitLabel: string }) {
  const [state, formAction] = useActionState(action, { status: "idle" } satisfies SettingsActionState);
  const error = (field: string) => state.fieldErrors?.[field]?.[0];

  return <form action={formAction} className={styles.form}>
    {state.message ? <div className={styles.formMessage} data-status={state.status} role="alert">{state.message}</div> : null}
    
    <div className={styles.sectionHeader}>
      <h2>Informasi lokasi</h2>
      <p>Kelola nama bangunan, lantai, atau sayap tempat kamar berada.</p>
    </div>
    <hr className={styles.divider} />

    <div className={styles.formFields}>
      <div className={styles.field}>
        <div className={styles.fieldLabelRow}>
          <span>Nama lokasi</span>
        </div>
        <input name="name" maxLength={100} defaultValue={defaults.name} aria-invalid={Boolean(error("name"))} placeholder="Contoh: Lantai 1" required />
        {error("name") ? <small className={styles.fieldError}>{error("name")}</small> : null}
      </div>

      <div className={styles.field}>
        <div className={styles.fieldLabelRow}>
          <span>Deskripsi</span>
          <em>Opsional</em>
        </div>
        <textarea
          name="description"
          rows={3}
          maxLength={500}
          defaultValue={defaults.description ?? ""}
          placeholder="Contoh: Gedung utama dekat resepsionis"
          aria-invalid={Boolean(error("description"))}
        />
        {error("description") ? <small className={styles.fieldError}>{error("description")}</small> : null}
      </div>
    </div>

    <div className={styles.formActions}>
      <Link className={styles.secondaryButton} href="/dashboard/settings?tab=locations">Batal</Link>
      <SubmitButton label={submitLabel} />
    </div>
  </form>;
}

export const statusOptions: { value: RoomStatus; label: string }[] = [
  { value: "CLEAN", label: "Bersih" }, { value: "DIRTY", label: "Kotor" },
  { value: "MAINTENANCE", label: "Pemeliharaan" }, { value: "OUT_OF_ORDER", label: "Rusak" },
];

const roleOptions: { value: StaffRole; label: string }[] = [
  { value: "ADMIN", label: "Administrator" }, { value: "FRONT_DESK", label: "Resepsionis" }, { value: "HOUSEKEEPING", label: "Housekeeping" },
];

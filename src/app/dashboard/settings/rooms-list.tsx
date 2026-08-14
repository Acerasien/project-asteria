"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { StatusBadge } from "@/components/ui/status-badge";
import { ChevronRight } from "lucide-react";
import type { RoomStatus } from "@/db/schema";
import { bulkUpdateRoomsAction, type SettingsActionState } from "./actions";
import { statusOptions } from "./settings-forms";
import styles from "./settings.module.css";

type RoomRow = { id: string; bedNumber: string; status: RoomStatus; roomName: string; reservationCount: number };

function ApplyButton() {
  const { pending } = useFormStatus();
  return <button className={styles.secondaryButton} type="submit" disabled={pending}>{pending ? "Menerapkan…" : "Terapkan"}</button>;
}

export function RoomsList({ rooms }: { rooms: RoomRow[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [state, action] = useActionState(bulkUpdateRoomsAction, { status: "idle" } satisfies SettingsActionState);
  const allSelected = rooms.length > 0 && selected.length === rooms.length;
  const toggle = (id: string) => setSelected((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  const toggleAll = () => setSelected(allSelected ? [] : rooms.map((room) => room.id));

  return <form action={action} className={styles.listPanel}>
    <div className={styles.bulkBar}>
      <span>{selected.length ? `${selected.length} dipilih` : `${rooms.length} kasur`}</span>
      <div><label><span className={styles.srOnly}>Atur kasur terpilih ke</span><select name="status" defaultValue="CLEAN">{statusOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label><ApplyButton /></div>
    </div>
    {state.message ? <div className={styles.inlineMessage} data-status={state.status} role="alert">{state.message}</div> : null}
    {rooms.length ? <>
      <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th className={styles.checkCell}><input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Pilih semua kasur" /></th><th>Kasur</th><th>Kamar</th><th>Status</th><th>Riwayat</th><th><span className={styles.srOnly}>Kelola</span></th></tr></thead><tbody>{rooms.map((room) => <tr key={room.id}><td className={styles.checkCell}><input name="roomIds" value={room.id} type="checkbox" checked={selected.includes(room.id)} onChange={() => toggle(room.id)} aria-label={`Pilih kasur ${room.bedNumber}`} /></td><td><strong>{room.bedNumber}</strong></td><td>{room.roomName}</td><td><StatusBadge status={room.status} /></td><td>{room.reservationCount} masa inap</td><td><Link href={`/dashboard/settings/rooms/${room.id}`}>Kelola</Link></td></tr>)}</tbody></table></div>
      <div className={styles.mobileCards}>
        {rooms.map((room) => (
          <article className={styles.mobileCard} key={room.id}>
            <label className={styles.mobileSelect}>
              <input name="roomIds" value={room.id} type="checkbox" checked={selected.includes(room.id)} onChange={() => toggle(room.id)} />
              <span className={styles.srOnly}>Pilih kasur {room.bedNumber}</span>
            </label>
            <Link href={`/dashboard/settings/rooms/${room.id}`} className={styles.mobileCardLink}>
              <div className={styles.mobileCardContent}>
                <span className={styles.mobileCardTitleRow}>
                  <strong>Kasur {room.bedNumber}</strong>
                  <StatusBadge status={room.status} />
                </span>
                <p>{room.roomName}</p>
                <small>{room.reservationCount} masa inap tercatat</small>
              </div>
              <ChevronRight size={18} className={styles.mobileChevron} />
            </Link>
          </article>
        ))}
      </div>
    </> : <div className={styles.empty}><h2>Belum ada kasur</h2><p>Tambahkan kasur pertama setelah membuat kamar.</p></div>}
  </form>;
}

"use client";

import Link from "next/link";
import { ChevronRight, Archive } from "lucide-react";
import type { RoomStatus } from "@/db/schema";
import styles from "./settings.module.css";

type ArchivedRoomRow = {
  id: string;
  bedNumber: string;
  status: RoomStatus;
  roomName: string;
  reservationCount: number;
};

export function ArchivedRoomsList({ rooms }: { rooms: ArchivedRoomRow[] }) {
  return (
    <div className={styles.listPanel}>
      <div className={styles.bulkBar}>
        <span>{rooms.length} kasur terarsip</span>
      </div>

      {rooms.length ? (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Kasur</th>
                  <th>Kamar</th>
                  <th>Total Masa Inap</th>
                  <th>Status Terakhir</th>
                  <th>
                    <span className={styles.srOnly}>Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                        <Archive size={14} style={{ color: "var(--color-ink-secondary)" }} />
                        <strong>{room.bedNumber}</strong>
                      </div>
                    </td>
                    <td>{room.roomName}</td>
                    <td>{room.reservationCount} masa inap</td>
                    <td>
                      <span className={styles.roleBadge} data-role="HOUSEKEEPING" style={{ textTransform: "capitalize", fontSize: "0.75rem" }}>
                        Nonaktif ({room.status.toLowerCase()})
                      </span>
                    </td>
                    <td>
                      <Link href={`/dashboard/settings/rooms/${room.id}/history`} className={styles.backLink} style={{ margin: 0, fontSize: "0.875rem" }}>
                        Lihat Riwayat
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.mobileCards}>
            {rooms.map((room) => (
              <article className={styles.mobileCard} key={room.id}>
                <Link href={`/dashboard/settings/rooms/${room.id}/history`} className={styles.mobileCardLink}>
                  <div className={styles.mobileCardContent}>
                    <span className={styles.mobileCardTitleRow}>
                      <span style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                        <Archive size={15} style={{ color: "var(--color-ink-secondary)" }} />
                        <strong>Kasur {room.bedNumber}</strong>
                      </span>
                      <span className={styles.roleBadge} data-role="HOUSEKEEPING" style={{ textTransform: "capitalize", fontSize: "0.7rem", padding: "2px 6px" }}>
                        Nonaktif
                      </span>
                    </span>
                    <p>{room.roomName}</p>
                    <small>{room.reservationCount} masa inap tercatat</small>
                  </div>
                  <ChevronRight size={18} className={styles.mobileChevron} />
                </Link>
              </article>
            ))}
          </div>
        </>
      ) : (
        <div className={styles.empty}>
          <h2>Belum ada kasur terarsip</h2>
          <p>Kasur sementara yang dinonaktifkan akan muncul di sini untuk pencatatan riwayat.</p>
        </div>
      )}
    </div>
  );
}

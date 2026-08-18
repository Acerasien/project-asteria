import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, History, CalendarRange } from "lucide-react";
import { getRoomForEdit, getBedReservationHistory } from "@/modules/settings/queries";
import { StatusBadge } from "@/components/ui/status-badge";
import styles from "../../../settings.module.css";

export const dynamic = "force-dynamic";

export default async function BedHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [{ room }, history] = await Promise.all([
    getRoomForEdit(id),
    getBedReservationHistory(id),
  ]);

  if (!room) notFound();

  const backTab = room.isActive ? "rooms" : "archived-rooms";
  const backLabel = room.isActive ? "Kasur" : "Arsip Kasur";

  return (
    <div className={styles.narrowPage} style={{ maxWidth: "48rem" }}>
      <Link href={`/dashboard/settings?tab=${backTab}`} className={styles.backLink}>
        <ChevronLeft size={17} />
        {backLabel}
      </Link>

      <header className={styles.editorHeader}>
        <h1>Riwayat Reservasi</h1>
        <p>Masa inap historis dan status operasional yang tercatat untuk kasur ini.</p>
        <div className={styles.roomTypeBadge} style={{ display: "inline-flex", gap: "var(--space-2)", alignItems: "center" }}>
          <History size={16} />
          <span>Kasur {room.bedNumber} {room.isActive ? "" : "(Terarsip)"}</span>
        </div>
      </header>

      <section className={styles.listPanel}>
        <div className={styles.sectionContentHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <CalendarRange size={18} style={{ color: "var(--color-accent)" }} />
            <h2>Daftar Masa Inap</h2>
          </div>
          <span>{history.length} reservasi</span>
        </div>

        {history.length ? (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Tamu</th>
                    <th>Kode Booking</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((reservation) => (
                    <tr key={reservation.id}>
                      <td>
                        <Link href={`/dashboard/reservations/${reservation.id}`} className={styles.backLink} style={{ margin: 0, fontWeight: 600 }}>
                          {reservation.guestName}
                        </Link>
                      </td>
                      <td>
                        <code style={{ fontFamily: "monospace", fontSize: "0.85rem", background: "var(--color-surface-subtle)", padding: "2px 6px", borderRadius: "var(--radius-xs)" }}>
                          {reservation.bookingCode}
                        </code>
                      </td>
                      <td style={{ fontSize: "0.875rem" }}>
                        {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(reservation.checkInDate))}
                      </td>
                      <td style={{ fontSize: "0.875rem" }}>
                        {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(reservation.checkOutDate))}
                      </td>
                      <td>
                        <StatusBadge status={reservation.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.mobileCards}>
              {history.map((reservation) => (
                <article className={styles.mobileCard} key={reservation.id}>
                  <Link href={`/dashboard/reservations/${reservation.id}`} className={styles.mobileCardLink}>
                    <div className={styles.mobileCardContent}>
                      <span className={styles.mobileCardTitleRow}>
                        <strong>{reservation.guestName}</strong>
                        <StatusBadge status={reservation.status} />
                      </span>
                      <p>Kode: {reservation.bookingCode}</p>
                      <small>
                        {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(reservation.checkInDate))} - {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(reservation.checkOutDate))}
                      </small>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className={styles.empty}>
            <h2>Belum ada riwayat</h2>
            <p>Kasur ini belum memiliki catatan reservasi atau masa inap.</p>
          </div>
        )}
      </section>
    </div>
  );
}

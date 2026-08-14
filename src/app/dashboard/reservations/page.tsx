import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatShortDate } from "@/lib/hotel-date";
import { getReservations, type ReservationFilters } from "@/modules/reservations/queries";
import styles from "./reservations.module.css";

export const dynamic = "force-dynamic";

function pageHref(filters: ReservationFilters, page: number) {
  const params = new URLSearchParams();
  if (filters.query) params.set("query", filters.query);
  if (filters.status) params.set("status", filters.status);
  params.set("page", String(page));
  return `/dashboard/reservations?${params}`;
}

export default async function ReservationsPage({ searchParams }: { searchParams: Promise<ReservationFilters> }) {
  const filters = await searchParams;
  const data = await getReservations(filters);

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div><h1>Reservasi</h1><p>Cari masa inap, perbarui penugasan kamar, dan kelola kedatangan serta keberangkatan.</p></div>
        <Link href="/dashboard/reservations/new" className={styles.primaryButton}><Plus size={17} aria-hidden="true" />Reservasi baru</Link>
      </header>

      <form className={styles.filters} method="get">
        <label className={styles.searchField}><Search size={17} aria-hidden="true" /><span className={styles.srOnly}>Cari reservasi</span><input type="search" name="query" defaultValue={data.query} placeholder="Tamu, kode pemesanan, atau kamar" /></label>
        <label><span className={styles.srOnly}>Filter berdasarkan status</span><select name="status" defaultValue={data.status ?? ""}><option value="">Semua status</option><option value="CONFIRMED">Dikonfirmasi</option><option value="CHECKED_IN">Sudah Check-In</option><option value="CHECKED_OUT">Sudah Check-Out</option><option value="CANCELLED">Dibatalkan</option></select></label>
        <button className={styles.secondaryButton} type="submit">Terapkan filter</button>
        {(data.query || data.status) ? <Link className={styles.clearLink} href="/dashboard/reservations">Bersihkan</Link> : null}
      </form>

      <section className={styles.listPanel} aria-label="Hasil reservasi">
        <div className={styles.listSummary}><span>{data.total} reservasi</span><span>Halaman {data.page} dari {data.pages}</span></div>
        {data.rows.length ? (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th>Pemesanan</th><th>Tamu</th><th>Kamar</th><th>Masa Inap</th><th>Status</th><th><span className={styles.srOnly}>Buka</span></th></tr></thead>
                <tbody>{data.rows.map((reservation) => (
                  <tr key={reservation.id}>
                    <td><strong>{reservation.bookingCode}</strong></td>
                    <td>{reservation.guestName}</td>
                    <td>{reservation.roomNumber}</td>
                    <td>{formatShortDate(reservation.checkInDate)} – {formatShortDate(reservation.checkOutDate)}</td>
                    <td><StatusBadge status={reservation.status} /></td>
                    <td><Link href={`/dashboard/reservations/${reservation.id}`} aria-label={`Buka ${reservation.bookingCode}`}>Lihat</Link></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <div className={styles.mobileCards}>{data.rows.map((reservation) => (
              <Link href={`/dashboard/reservations/${reservation.id}`} className={styles.mobileCard} key={reservation.id}>
                <span className={styles.cardTop}><strong>{reservation.guestName}</strong><StatusBadge status={reservation.status} /></span>
                <span>{reservation.bookingCode} · Kamar {reservation.roomNumber}</span>
                <small>{formatShortDate(reservation.checkInDate)} – {formatShortDate(reservation.checkOutDate)}</small>
              </Link>
            ))}</div>
          </>
        ) : <div className={styles.empty}><h2>Reservasi tidak ditemukan</h2><p>Coba ubah pencarian atau filter status.</p></div>}
        {data.pages > 1 ? <nav className={styles.pagination} aria-label="Halaman reservasi">
          {data.page > 1 ? <Link href={pageHref(filters, data.page - 1)}>Sebelumnya</Link> : <span>Sebelumnya</span>}
          {data.page < data.pages ? <Link href={pageHref(filters, data.page + 1)}>Berikutnya</Link> : <span>Berikutnya</span>}
        </nav> : null}
      </section>
    </div>
  );
}


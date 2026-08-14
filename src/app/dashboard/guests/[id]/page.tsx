import Link from "next/link";
import { ChevronLeft, Plus } from "lucide-react";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatShortDate } from "@/lib/hotel-date";
import { getGuestProfile } from "@/modules/guests/queries";
import { updateGuestAction, deleteGuestAction } from "../actions";
import { GuestForm } from "../guest-form";
import styles from "../guests.module.css";

export const dynamic = "force-dynamic";

export default async function GuestProfilePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string; updated?: string }> }) {
  const { id } = await params;
  const [profile, notice] = await Promise.all([getGuestProfile(id), searchParams]);
  if (!profile) notFound();
  const { guest, history } = profile;
  const updateAction = updateGuestAction.bind(null, guest.id);
  const deleteAction = deleteGuestAction.bind(null, guest.id);

  return <div className={styles.page}>
    <Link href="/dashboard/guests" className={styles.backLink}><ChevronLeft size={17} />Tamu</Link>
    <header className={styles.profileHeader}><div><span>Profil tamu</span><h1>{guest.fullName}</h1><p>{guest.phone}{guest.email ? ` · ${guest.email}` : ""}</p></div><Link href={`/dashboard/reservations/new?guestId=${guest.id}`} className={styles.primaryButton}><Plus size={17} />Reservasi baru</Link></header>
    {notice.created ? <div className={styles.successNotice}>Catatan tamu dibuat.</div> : notice.updated ? <div className={styles.successNotice}>Catatan tamu diperbarui.</div> : null}
    <div className={styles.profileGrid}>
      <main className={styles.profileMain}>
        <section className={styles.historyPanel} aria-labelledby="history-title"><div className={styles.panelHeader}><div><h2 id="history-title">Riwayat reservasi</h2><p>{history.length} reservasi</p></div></div>
          {history.length ? <><div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Pemesanan</th><th>Kamar</th><th>Masa Inap</th><th>Status</th><th><span className={styles.srOnly}>Buka</span></th></tr></thead><tbody>{history.map((reservation) => <tr key={reservation.id}><td><strong>{reservation.bookingCode}</strong></td><td>{reservation.roomNumber}</td><td>{formatShortDate(reservation.checkInDate)} – {formatShortDate(reservation.checkOutDate)}</td><td><StatusBadge status={reservation.status} /></td><td><Link href={`/dashboard/reservations/${reservation.id}`}>Lihat</Link></td></tr>)}</tbody></table></div><div className={styles.mobileHistory}>{history.map((reservation) => <Link href={`/dashboard/reservations/${reservation.id}`} key={reservation.id}><span><strong>{reservation.bookingCode}</strong><small>Kamar {reservation.roomNumber}</small></span><StatusBadge status={reservation.status} /><small>{formatShortDate(reservation.checkInDate)} – {formatShortDate(reservation.checkOutDate)}</small></Link>)}</div></> : <div className={styles.emptyCompact}><p>Belum ada reservasi.</p><Link href={`/dashboard/reservations/new?guestId=${guest.id}`}>Buat reservasi pertama</Link></div>}
        </section>
        <section className={styles.formPanel} aria-labelledby="edit-title"><h2 id="edit-title">Edit detail tamu</h2><GuestForm action={updateAction} deleteAction={deleteAction} defaults={guest} submitLabel="Simpan perubahan" cancelHref={`/dashboard/guests/${guest.id}`} /></section>
      </main>
      <aside className={styles.identityPanel}><h2>Informasi tamu</h2><dl><div><dt>Nama lengkap</dt><dd>{guest.fullName}</dd></div><div><dt>Telepon</dt><dd>{guest.phone}</dd></div><div><dt>Email</dt><dd>{guest.email ?? "Tidak disediakan"}</dd></div><div><dt>Nomor identitas</dt><dd>{guest.idNumber}</dd></div><div><dt>Tamu sejak</dt><dd>{guest.createdAt.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" })}</dd></div></dl>{guest.notes ? <div className={styles.profileNotes}><h3>Catatan internal</h3><p>{guest.notes}</p></div> : null}</aside>
    </div>
  </div>;
}


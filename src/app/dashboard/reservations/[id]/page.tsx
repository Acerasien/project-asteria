import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatShortDate } from "@/lib/hotel-date";
import { getReservation, getReservationOptions } from "@/modules/reservations/queries";
import { updateReservationAction } from "../actions";
import { LifecycleActions } from "../lifecycle-actions";
import { ReservationForm } from "../reservation-form";
import styles from "../reservations.module.css";

export const dynamic = "force-dynamic";

export default async function ReservationDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string; updated?: string }> }) {
  const { id } = await params;
  const reservation = await getReservation(id);
  if (!reservation) notFound();
  const [options, notice] = await Promise.all([getReservationOptions(reservation.guestId), searchParams]);
  const updateAction = updateReservationAction.bind(null, reservation.id);

  return <div className={styles.page}>
    <Link href="/dashboard/reservations" className={styles.backLink}><ChevronLeft size={17} />Reservasi</Link>
    <header className={styles.detailHeader}>
      <div><span>{reservation.bookingCode}</span><h1>{reservation.guestName}</h1><p>Kamar {reservation.roomNumber} · {reservation.roomType}</p></div>
      <StatusBadge status={reservation.status} />
    </header>
    {notice.created ? <div className={styles.successNotice}>Reservasi telah dibuat.</div> : notice.updated ? <div className={styles.successNotice}>Reservasi telah diperbarui.</div> : null}

    <div className={styles.detailGrid}>
      <main className={styles.detailMain}>
        <section className={styles.infoPanel} aria-labelledby="stay-title">
          <h2 id="stay-title">Detail masa inap</h2>
          <dl className={styles.detailsList}>
            <div><dt>Check-in</dt><dd>{formatShortDate(reservation.checkInDate)}</dd></div>
            <div><dt>Check-out</dt><dd>{formatShortDate(reservation.checkOutDate)}</dd></div>
            <div><dt>Telepon tamu</dt><dd>{reservation.guestPhone}</dd></div>
            <div><dt>Email tamu</dt><dd>{reservation.guestEmail ?? "Tidak disediakan"}</dd></div>
            <div><dt>Kesiapan kamar</dt><dd><StatusBadge status={reservation.roomStatus} /></dd></div>
            <div><dt>Dibuat oleh</dt><dd>{reservation.createdByName}</dd></div>
          </dl>
          {reservation.notes ? <div className={styles.notes}><h3>Catatan internal</h3><p>{reservation.notes}</p></div> : null}
        </section>

        {reservation.status === "CONFIRMED" ? <section className={styles.formPanel} aria-labelledby="edit-title"><h2 id="edit-title">Edit reservasi</h2><ReservationForm action={updateAction} options={options} defaults={reservation} submitLabel="Simpan perubahan" cancelHref={`/dashboard/reservations/${reservation.id}`} /></section> : null}
      </main>
      <aside className={styles.actionPanel}><h2>Aksi reservasi</h2><p>Aksi diperbarui segera dan dicatat pada masa inap saat ini.</p><LifecycleActions id={reservation.id} status={reservation.status} /></aside>
    </div>
  </div>;
}


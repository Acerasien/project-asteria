import Link from "next/link";
import { BedDouble, DoorOpen, LogIn, LogOut, Sparkles } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatShortDate } from "@/lib/hotel-date";
import { getDashboardData } from "@/modules/dashboard/queries";
import styles from "./dashboard.module.css";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const stats = [
    { label: "Kedatangan hari ini", value: data.summary.arrivals, icon: LogIn, href: "/dashboard/reservations" },
    { label: "Keberangkatan hari ini", value: data.summary.departures, icon: LogOut, href: "/dashboard/reservations" },
    {
      label: "Kamar terisi",
      value: `${data.summary.occupiedRooms}/${data.summary.totalRooms}`,
      detail: `${data.summary.occupancy}% okupansi`,
      icon: BedDouble,
      href: "/dashboard/calendar",
    },
    { label: "Kamar yang perlu dibersihkan", value: data.summary.dirtyRooms, icon: Sparkles, href: "/dashboard/housekeeping" },
  ];

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <h1>Ringkasan hari ini</h1>
          <p>Kedatangan, keberangkatan, okupansi, dan kesiapan kamar untuk giliran kerja saat ini.</p>
        </div>
        <Link href="/dashboard/reservations/new" className={styles.primaryAction}>Reservasi baru</Link>
      </header>

      <section className={styles.stats} aria-label="Today's hotel summary">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link href={stat.href} className={styles.stat} key={stat.label}>
              <span className={styles.statIcon}><Icon size={20} aria-hidden="true" /></span>
              <span className={styles.statCopy}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
                {stat.detail ? <small>{stat.detail}</small> : null}
              </span>
            </Link>
          );
        })}
      </section>

      <div className={styles.panels}>
        <section className={styles.panel} aria-labelledby="arrivals-title">
          <div className={styles.panelHeader}>
            <div><DoorOpen size={19} aria-hidden="true" /><h2 id="arrivals-title">Kedatangan mendatang</h2></div>
            <Link href="/dashboard/reservations">Lihat semua</Link>
          </div>
          {data.arrivals.length ? (
            <table className={styles.table}>
              <thead><tr><th>Tamu</th><th>Kamar</th><th>Check-in</th><th>Status</th></tr></thead>
              <tbody>
                {data.arrivals.map((arrival) => (
                  <tr key={arrival.id}>
                    <td><strong>{arrival.guestName}</strong><small>{arrival.bookingCode}</small></td>
                    <td>{arrival.roomNumber}</td>
                    <td>{formatShortDate(arrival.checkInDate)}</td>
                    <td><StatusBadge status={arrival.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className={styles.empty}>Tidak ada kedatangan yang diharapkan hari ini atau besok.</p>}
        </section>

        <section className={styles.panel} aria-labelledby="departures-title">
          <div className={styles.panelHeader}>
            <div><LogOut size={19} aria-hidden="true" /><h2 id="departures-title">Keberangkatan hari ini</h2></div>
            <Link href="/dashboard/reservations">Lihat semua</Link>
          </div>
          {data.departures.length ? (
            <table className={styles.table}>
              <thead><tr><th>Tamu</th><th>Kamar</th><th>Check-out</th><th>Status</th></tr></thead>
              <tbody>
                {data.departures.map((departure) => (
                  <tr key={departure.id}>
                    <td><strong>{departure.guestName}</strong><small>{departure.bookingCode}</small></td>
                    <td>{departure.roomNumber}</td>
                    <td>{formatShortDate(departure.checkOutDate)}</td>
                    <td><StatusBadge status={departure.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className={styles.empty}>Tidak ada keberangkatan yang dijadwalkan untuk hari ini.</p>}
        </section>
      </div>

      <section className={styles.attentionPanel} aria-labelledby="attention-title">
        <div className={styles.panelHeader}>
          <div><Sparkles size={19} aria-hidden="true" /><h2 id="attention-title">Kamar yang perlu perhatian</h2></div>
          <Link href="/dashboard/housekeeping">Buka housekeeping</Link>
        </div>
        {data.attention.length ? (
          <div className={styles.attentionList}>
            {data.attention.map((room) => (
              <Link href="/dashboard/housekeeping" className={styles.attentionItem} key={room.id}>
                <span><strong>{room.roomNumber}</strong><small>Lantai {room.floor}</small></span>
                <StatusBadge status={room.status} />
              </Link>
            ))}
          </div>
        ) : <p className={styles.empty}>Semua kamar bersih.</p>}
      </section>
    </div>
  );
}

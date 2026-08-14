import Link from "next/link";
import { BedDouble } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import type { RoomStatus } from "@/db/schema";
import { getHousekeepingBoard, type HousekeepingFilters } from "@/modules/housekeeping/queries";
import { RoomStatusControl } from "./room-status-control";
import styles from "./housekeeping.module.css";

export const dynamic = "force-dynamic";

function groupByFloor<T extends { floor: string | null }>(items: T[]) {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = item.floor ?? "Tanpa Lokasi";
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return groups;
}

const filters: Array<{ status?: RoomStatus; label: string }> = [
  { label: "Semua kamar" },
  { status: "DIRTY", label: "Kotor" },
  { status: "MAINTENANCE", label: "Pemeliharaan" },
  { status: "OUT_OF_ORDER", label: "Rusak" },
];

export default async function HousekeepingPage({ searchParams }: { searchParams: Promise<HousekeepingFilters> }) {
  const data = await getHousekeepingBoard(await searchParams);
  const grouped = groupByFloor(data.rooms);
  return <div className={styles.page}>
    <header className={styles.pageHeader}><div><h1>Housekeeping</h1><p>Tinjau kesiapan kamar dan perbarui status operasional per lantai.</p></div><div className={styles.totalRooms}><BedDouble size={18} aria-hidden="true" /><span><strong>{data.total}</strong> kamar</span></div></header>

    <nav className={styles.filterTabs} aria-label="Filter kamar berdasarkan status">{filters.map((filter) => {
      const active = data.status === filter.status;
      const count = filter.status ? data.counts[filter.status] : data.total;
      return <Link href={filter.status ? `/dashboard/housekeeping?status=${filter.status}` : "/dashboard/housekeeping"} aria-current={active ? "page" : undefined} key={filter.label}>{filter.label}<span>{count}</span></Link>;
    })}</nav>

    {data.rooms.length ? <div className={styles.floors}>{[...grouped.entries()].map(([floor, floorRooms]) => <section className={styles.floorSection} aria-labelledby={`floor-${floor}`} key={floor}>
      <header className={styles.floorHeader}><div><h2 id={`floor-${floor}`}>{floor}</h2><span>{floorRooms.length} kasur</span></div></header>
      <div className={styles.roomGrid}>{floorRooms.map((room) => <article className={styles.roomCard} data-status={room.status} key={room.id}>
        <div className={styles.roomTop}><span><strong>Kamar {room.roomNumber}</strong><small>{room.roomType}</small></span><StatusBadge status={room.status} /></div>
        <div className={styles.occupancy} data-occupied={Boolean(room.reservationId) || undefined}>{room.reservationId ? <><span>Ditempati oleh</span><Link href={`/dashboard/reservations/${room.reservationId}`}>{room.guestName}<small>{room.bookingCode}</small></Link></> : <><span>Okupansi</span><strong>Kosong</strong></>}</div>
        <RoomStatusControl roomId={room.id} roomNumber={room.roomNumber} currentStatus={room.status} />
      </article>)}</div>
    </section>)}</div> : <section className={styles.empty}><h2>Tidak ada kamar yang cocok dengan filter ini</h2><p>Pilih status lain untuk melihat dan memperbarui kamar.</p><Link href="/dashboard/housekeeping">Tampilkan semua kamar</Link></section>}
  </div>;
}

import type { CSSProperties } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { hotelDate } from "@/lib/hotel-date";
import { addCalendarDays, type CalendarSearchParams } from "@/modules/calendar/date-window";
import { getCalendarData } from "@/modules/calendar/queries";
import { CalendarControls } from "./calendar-controls";
import styles from "./calendar.module.css";

export const dynamic = "force-dynamic";

type CalendarStyle = CSSProperties & { "--calendar-days": number };

function dateIndex(date: string, start: string) {
  return Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86_400_000);
}

const statusLabels: Record<string, string> = {
  CLEAN: "bersih",
  DIRTY: "kotor",
  MAINTENANCE: "pemeliharaan",
  OUT_OF_ORDER: "rusak",
};

const reservationStatusLabels: Record<string, string> = {
  CONFIRMED: "dikonfirmasi",
  CHECKED_IN: "sudah check-in",
  CHECKED_OUT: "sudah check-out",
  CANCELLED: "dibatalkan",
};

function dayLabel(date: string) {
  return new Intl.DateTimeFormat("id-ID", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));
}

function longDayLabel(date: string) {
  return new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));
}

function guestLabel(name: string) {
  return name.trim().split(/\s+/).at(-1) ?? name;
}

function nightCount(checkIn: string, checkOut: string) {
  return Math.round((Date.parse(`${checkOut}T00:00:00Z`) - Date.parse(`${checkIn}T00:00:00Z`)) / 86_400_000);
}

function groupBy<T, K extends string | number>(items: T[], keyFor: (item: T) => K) {
  const groups = new Map<K, T[]>();
  for (const item of items) {
    const key = keyFor(item);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return groups;
}

export default async function CalendarPage({ searchParams }: { searchParams: Promise<CalendarSearchParams> }) {
  const data = await getCalendarData(await searchParams);
  const today = hotelDate();
  const reservationsByRoom = groupBy(data.reservations, (reservation) => reservation.roomId);
  const groupedRooms = groupBy(data.rooms, (room) => room.location ?? "Tanpa Lokasi");
  const gridStyle = { "--calendar-days": data.days } as CalendarStyle;

  return <div className={styles.page}>
    <header className={styles.pageHeader}>
      <div><h1>Kalender kamar</h1><p>Tinjau ketersediaan dan masa inap yang terbuka di seluruh properti.</p></div>
      <Link href="/dashboard/reservations/new" className={styles.primaryButton}><Plus size={17} aria-hidden="true" />Reservasi baru</Link>
    </header>

    <CalendarControls start={data.start} days={data.days} location={data.location} status={data.status} locations={data.locations.filter((loc): loc is string => typeof loc === "string")} />

    {data.rooms.length ? <>
      <section className={styles.timelinePanel} aria-label={`Ketersediaan kamar ${data.days} hari`}>
        <div className={styles.timeline} style={gridStyle}>
          <div className={styles.timelineHeader} style={gridStyle}>
            <div className={styles.roomHeading}>Kamar</div>
            {data.dates.map((date) => <div className={styles.dayHeading} data-today={date === today || undefined} key={date}><span>{dayLabel(date).split(" ")[0]}</span><strong>{dayLabel(date).split(" ").slice(1).join(" ")}</strong></div>)}
          </div>
          {[...groupedRooms.entries()].map(([floor, floorRooms]) => {
            const byKamar = groupBy(floorRooms, (bed) => bed.type ?? "Kamar");
            return <div className={styles.floorGroup} key={floor}>
              <div className={styles.floorHeading}>{floor}<span>{floorRooms.length} kasur</span></div>
              {[...byKamar.entries()].map(([kamarName, beds]) => (
                <div className={styles.roomSubgroup} key={kamarName}>
                  <div className={styles.roomSubheading}>{kamarName}<span>{beds.length} kasur</span></div>
                  {beds.map((room) => {
                    const roomReservations = reservationsByRoom.get(room.id) ?? [];
                    const blocked = room.status === "MAINTENANCE" || room.status === "OUT_OF_ORDER";
                    return <div className={styles.roomRow} data-room-status={room.status} style={gridStyle} key={room.id}>
                      <div className={styles.roomLabel}><strong>{room.number}</strong><StatusBadge status={room.status} /></div>
                      {data.dates.map((date) => {
                        const occupied = roomReservations.some((reservation) => reservation.checkInDate <= date && reservation.checkOutDate > date);
                        return <div className={styles.dayCell} data-today={date === today || undefined} key={date}>
                          {!occupied && !blocked ? <Link href={`/dashboard/reservations/new?roomId=${room.id}&checkInDate=${date}&checkOutDate=${addCalendarDays(date, 1)}`} aria-label={`Buat reservasi untuk kasur ${room.number} di ${kamarName}, ${longDayLabel(date)}`}><span aria-hidden="true">+</span></Link> : blocked ? <span className={styles.unavailable} aria-label={`Kasur ${room.number} berstatus ${statusLabels[room.status]}`} /> : null}
                        </div>;
                      })}
                      {roomReservations.map((reservation) => {
                        const clippedStart = reservation.checkInDate < data.start ? data.start : reservation.checkInDate;
                        const clippedEnd = reservation.checkOutDate > data.endExclusive ? data.endExclusive : reservation.checkOutDate;
                        const startColumn = dateIndex(clippedStart, data.start) + 2;
                        const span = Math.max(1, dateIndex(clippedEnd, clippedStart));
                        const nights = nightCount(reservation.checkInDate, reservation.checkOutDate);
                        return <Link
                          href={`/dashboard/reservations/${reservation.id}`}
                          className={styles.reservationBlock}
                          data-status={reservation.status}
                          style={{ gridColumn: `${startColumn} / span ${span}` }}
                          title={`${reservation.guestName} · ${reservation.bookingCode} · ${reservation.checkInDate} s/d ${reservation.checkOutDate} · ${nights} malam`}
                          aria-label={`${reservation.guestName}, ${reservation.bookingCode}, kasur ${room.number} di ${kamarName}, ${longDayLabel(reservation.checkInDate)} sampai ${longDayLabel(reservation.checkOutDate)}, ${nights} malam`}
                          key={reservation.id}
                        ><span className={styles.blockGuest}>{guestLabel(reservation.guestName)}</span><span className={styles.blockNights}>{nights}m</span></Link>;
                      })}
                    </div>;
                  })}
                </div>
              ))}
            </div>;
          })}
        </div>
      </section>

      <section className={styles.mobileDay} aria-labelledby="mobile-day-title">
        <header><div><span>Hari terpilih</span><h2 id="mobile-day-title">{longDayLabel(data.start)}</h2></div><strong>{data.rooms.length} kamar</strong></header>
        <div className={styles.mobileRoomList}>{data.rooms.map((room) => {
          const reservation = (reservationsByRoom.get(room.id) ?? []).find((item) => item.checkInDate <= data.start && item.checkOutDate > data.start);
          const blocked = room.status === "MAINTENANCE" || room.status === "OUT_OF_ORDER";
          const content = <><span className={styles.mobileRoomIdentity}><strong>{room.type}</strong><small>{room.number}</small></span><StatusBadge status={room.status} /><span className={styles.mobileOccupancy}>{reservation ? <><strong>{reservation.guestName}</strong><small>{reservation.bookingCode} · {reservationStatusLabels[reservation.status]}</small></> : <><strong>{blocked ? "Tidak Tersedia" : "Tersedia"}</strong><small>{blocked ? "Status kamar mencegah pemesanan" : "Ketuk untuk membuat reservasi satu malam"}</small></>}</span></>;
          return reservation ? <Link className={styles.mobileRoom} href={`/dashboard/reservations/${reservation.id}`} key={room.id}>{content}</Link> : blocked ? <div className={styles.mobileRoom} data-disabled="true" key={room.id}>{content}</div> : <Link className={styles.mobileRoom} href={`/dashboard/reservations/new?roomId=${room.id}&checkInDate=${data.start}&checkOutDate=${addCalendarDays(data.start, 1)}`} key={room.id}>{content}</Link>;
        })}</div>
      </section>
    </> : <section className={styles.empty}><h2>Tidak ada kamar yang cocok dengan filter ini</h2><p>Bersihkan filter lantai atau status kamar untuk memulihkan kalender.</p><Link href="/dashboard/calendar">Bersihkan filter</Link></section>}
  </div>;
}

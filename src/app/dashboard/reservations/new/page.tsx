import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { hotelDate } from "@/lib/hotel-date";
import { addCalendarDays, isIsoDate } from "@/modules/calendar/date-window";
import { getReservationOptions } from "@/modules/reservations/queries";
import { createReservationAction } from "../actions";
import { ReservationForm } from "../reservation-form";
import styles from "../reservations.module.css";

export const dynamic = "force-dynamic";

type NewReservationParams = { guestId?: string | string[]; roomId?: string | string[]; checkInDate?: string | string[]; checkOutDate?: string | string[] };

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NewReservationPage({ searchParams }: { searchParams: Promise<NewReservationParams> }) {
  const params = await searchParams;
  const requestedGuest = first(params.guestId);
  const options = await getReservationOptions(requestedGuest);
  const requestedRoom = first(params.roomId);
  const requestedCheckIn = first(params.checkInDate);
  const requestedCheckOut = first(params.checkOutDate);
  const checkInDate = isIsoDate(requestedCheckIn) ? requestedCheckIn : hotelDate();
  const checkOutDate = isIsoDate(requestedCheckOut) && requestedCheckOut > checkInDate ? requestedCheckOut : addCalendarDays(checkInDate, 1);
  const roomId = options.rooms.some((room) => room.id === requestedRoom) ? requestedRoom : undefined;
  const guestId = options.guests.some((guest) => guest.id === requestedGuest) ? requestedGuest : undefined;
  return <div className={styles.narrowPage}>
    <Link href="/dashboard/reservations" className={styles.backLink}><ChevronLeft size={17} />Reservasi</Link>
    <header className={styles.pageHeader}><div><h1>Reservasi baru</h1><p>Tempatkan tamu yang terdaftar ke kamar dan konfirmasikan tanggal menginap.</p></div></header>
    <section className={styles.formPanel}>
      <ReservationForm action={createReservationAction} options={options} defaults={{ guestId, roomId, checkInDate, checkOutDate }} submitLabel="Buat reservasi" cancelHref={roomId ? `/dashboard/calendar?start=${checkInDate}` : guestId ? `/dashboard/guests/${guestId}` : "/dashboard/reservations"} />
    </section>
  </div>;
}

import Link from "next/link";
import { Plus } from "lucide-react";
import { hotelDate } from "@/lib/hotel-date";
import { getRoomsStatusData } from "@/modules/rooms/queries";
import { groupRooms, filterGroupedRooms } from "@/modules/rooms/utils";
import { RoomsControls } from "./rooms-controls";
import styles from "./rooms.module.css";

export const dynamic = "force-dynamic";

interface RoomsPageProps {
  searchParams: Promise<{
    date?: string;
    search?: string;
  }>;
}

const bedStatusLabels: Record<string, string> = {
  CLEAN: "Bersih",
  DIRTY: "Kotor",
  MAINTENANCE: "Pemeliharaan",
  OUT_OF_ORDER: "Rusak",
};

const reservationStatusLabels: Record<string, string> = {
  CONFIRMED: "Dikonfirmasi",
  CHECKED_IN: "Sudah Check-In",
  CHECKED_OUT: "Sudah Check-Out",
};

export default async function RoomsStatusPage({ searchParams }: RoomsPageProps) {
  const resolvedParams = await searchParams;
  const targetDate = resolvedParams.date || hotelDate();
  const searchVal = resolvedParams.search || "";

  const rawRows = await getRoomsStatusData(targetDate);
  const groupedLocations = groupRooms(rawRows);
  const filteredLocations = filterGroupedRooms(groupedLocations, searchVal);

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <h1>Status Kamar & Kasur</h1>
          <p>
            Tinjau ketersediaan dan status okupansi kasur di setiap kamar untuk tanggal yang dipilih.
          </p>
        </div>
        <Link href="/dashboard/reservations/new" className={styles.primaryButton}>
          <Plus size={17} aria-hidden="true" />
          <span>Reservasi baru</span>
        </Link>
      </header>

      <RoomsControls currentDate={targetDate} initialSearch={searchVal} />

      {filteredLocations.length ? (
        <div className={styles.grid}>
          {filteredLocations.flatMap((location) =>
            location.rooms.map((room) => (
              <article key={room.id} className={styles.roomCard}>
                <header className={styles.roomHeader}>
                  <div className={styles.roomInfo}>
                    <h2 className={styles.roomName}>{room.name}</h2>
                    <span className={styles.roomLocation}>
                      Lokasi: {location.name}
                    </span>
                  </div>
                  <span
                    className={`${styles.genderBadge} ${
                      room.isMixedGender ? styles.genderMixed : styles.genderSingle
                    }`}
                  >
                    {room.isMixedGender ? "Campuran" : "Gender Tunggal"}
                  </span>
                </header>

                <div className={styles.bedsList}>
                  {room.beds.map((bed) => {
                    const isOccupied = !!bed.reservation;
                    return (
                      <div key={bed.id} className={styles.bedItem}>
                        <div className={styles.bedMeta}>
                          <span className={styles.bedNumber}>{bed.number}</span>
                          <span
                            className={`${styles.bedStatusBadge} ${
                              styles[`status${bed.status}`]
                            }`}
                          >
                            {bedStatusLabels[bed.status] || bed.status}
                          </span>
                        </div>

                        <div className={styles.bedContent}>
                          {isOccupied ? (
                            <div className={styles.occupied}>
                              <Link
                                href={`/dashboard/reservations/${bed.reservation!.id}`}
                                className={styles.occupantLink}
                              >
                                {bed.reservation!.guestName}
                              </Link>
                              <div className={styles.occupantSub}>
                                <span className={styles.bookingCode}>
                                  {bed.reservation!.bookingCode}
                                </span>
                                <span
                                  className={`${styles.resBadge} ${
                                    styles[`res${bed.reservation!.status}`]
                                  }`}
                                >
                                  {reservationStatusLabels[bed.reservation!.status]}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className={styles.vacant}>
                              <span className={styles.vacantText}>Tersedia</span>
                              <Link
                                href={`/dashboard/reservations/new?roomId=${room.id}&bedId=${bed.id}&checkInDate=${targetDate}`}
                                className={styles.bookLink}
                              >
                                + Reservasi
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>
            ))
          )}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <h2>Kamar atau tamu tidak ditemukan</h2>
          <p>
            {searchVal
              ? "Coba cari nama tamu, nomor kamar, atau nama lokasi lainnya."
              : "Belum ada kamar atau kasur yang terdaftar."}
          </p>
          {searchVal ? (
            <Link href="/dashboard/rooms">Bersihkan filter</Link>
          ) : null}
        </div>
      )}
    </div>
  );
}

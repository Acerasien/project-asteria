import Link from "next/link";
import { ChevronLeft, Key, AlertTriangle, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { getRoomForEdit } from "@/modules/settings/queries";
import { db } from "@/db/client";
import { reservations } from "@/db/schema";
import { eq, count, and, inArray } from "drizzle-orm";
import { deleteRoomAction, updateRoomAction } from "../../actions";
import { DeleteControl } from "../../delete-control";
import { RoomForm } from "../../settings-forms";
import styles from "../../settings.module.css";

export const dynamic = "force-dynamic";

export default async function EditRoomPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string; updated?: string }> }) {
  const { id } = await params;
  const [[{ room, roomTypes }, notice], activeBookings] = await Promise.all([
    Promise.all([getRoomForEdit(id), searchParams]),
    db.select({ value: count() }).from(reservations).where(and(eq(reservations.bedId, id), inArray(reservations.status, ["CONFIRMED", "CHECKED_IN"]))),
  ]);

  if (!room) notFound();
  const isAssigned = (activeBookings?.[0]?.value ?? 0) > 0;

  return (
    <div className={styles.narrowPage}>
      <Link href="/dashboard/settings?tab=rooms" className={styles.backLink}>
        <ChevronLeft size={17} />
        Kasur
      </Link>
      
      <header className={styles.editorHeader}>
        <h1>Edit kasur</h1>
        <p>Perbarui detail inventaris dan status operasional.</p>
        <div className={styles.roomTypeBadge}>
          <Key size={16} />
          <span>Kasur {room.bedNumber}</span>
        </div>
      </header>

      {notice.created ? (
        <div className={styles.successNotice}>Kasur dibuat.</div>
      ) : notice.updated ? (
        <div className={styles.successNotice}>Kasur diperbarui.</div>
      ) : null}

      <section className={styles.formPanel}>
        <RoomForm
          action={updateRoomAction.bind(null, id)}
          roomTypes={roomTypes}
          defaults={room}
          submitLabel="Simpan perubahan"
        />
      </section>

      <section className={styles.dangerZone}>
        <header className={styles.dangerZoneHeader}>
          <AlertTriangle size={18} className={styles.dangerIcon} />
          <h2>Zona berbahaya</h2>
        </header>
        <div className={styles.dangerZoneContent}>
          <div className={styles.dangerZoneInfo}>
            <h3>Hapus kasur</h3>
            <p>Kasur hanya dapat dihapus jika tidak sedang digunakan oleh reservasi aktif.</p>
            {isAssigned && (
              <Link href="/dashboard/reservations" className={styles.assignedLink}>
                <ExternalLink size={14} />
                <span>Lihat reservasi yang menggunakan kasur ini</span>
              </Link>
            )}
          </div>
          <div className={styles.dangerZoneAction}>
            <DeleteControl
              action={deleteRoomAction.bind(null, id)}
              label="Hapus kasur"
              confirmMessage={`Hapus kasur ${room.bedNumber}? Tindakan ini tidak dapat dibatalkan.`}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

import Link from "next/link";
import { ChevronLeft, BedDouble, AlertTriangle, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { getRoomTypeForEdit } from "@/modules/settings/queries";
import { db } from "@/db/client";
import { beds } from "@/db/schema";
import { eq } from "drizzle-orm";
import { deleteRoomTypeAction, updateRoomTypeAction } from "../../actions";
import { DeleteControl } from "../../delete-control";
import { RoomTypeForm } from "../../settings-forms";
import styles from "../../settings.module.css";

export const dynamic = "force-dynamic";

export default async function EditRoomTypePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string; updated?: string }> }) {
  const { id } = await params;
  const [{ roomType, locations }, notice, roomsUsage] = await Promise.all([
    getRoomTypeForEdit(id),
    searchParams,
    db.select({ id: beds.id }).from(beds).where(eq(beds.roomId, id)).limit(1),
  ]);

  if (!roomType) notFound();
  const isAssigned = roomsUsage.length > 0;

  return (
    <div className={styles.narrowPage}>
      <Link href="/dashboard/settings?tab=room-types" className={styles.backLink}>
        <ChevronLeft size={17} />
        Kamar
      </Link>
      
      <header className={styles.editorHeader}>
        <h1>Edit kamar</h1>
        <p>Perubahan akan diterapkan pada semua kasur di kamar ini.</p>
        <div className={styles.roomTypeBadge}>
          <BedDouble size={16} />
          <span>{roomType.name}</span>
        </div>
      </header>

      {notice.created ? (
        <div className={styles.successNotice}>Kamar dibuat.</div>
      ) : notice.updated ? (
        <div className={styles.successNotice}>Kamar diperbarui.</div>
      ) : null}

      <section className={styles.formPanel}>
        <RoomTypeForm
          action={updateRoomTypeAction.bind(null, id)}
          locations={locations}
          defaults={roomType}
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
            <h3>Hapus kamar</h3>
            <p>Kamar hanya dapat dihapus jika tidak lagi memiliki kasur.</p>
            {isAssigned && (
              <Link href="/dashboard/settings?tab=rooms" className={styles.assignedLink}>
                <ExternalLink size={14} />
                <span>Lihat kasur yang berada di kamar ini</span>
              </Link>
            )}
          </div>
          <div className={styles.dangerZoneAction}>
            <DeleteControl
              action={deleteRoomTypeAction.bind(null, id)}
              label="Hapus kamar"
              confirmMessage={`Hapus ${roomType.name}? Tindakan ini tidak dapat dibatalkan.`}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

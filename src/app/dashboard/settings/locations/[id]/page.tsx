import Link from "next/link";
import { ChevronLeft, MapPin, AlertTriangle, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { getLocationForEdit } from "@/modules/settings/queries";
import { db } from "@/db/client";
import { rooms } from "@/db/schema";
import { eq } from "drizzle-orm";
import { deleteLocationAction, updateLocationAction } from "../../actions";
import { DeleteControl } from "../../delete-control";
import { LocationForm } from "../../settings-forms";
import styles from "../../settings.module.css";

export const dynamic = "force-dynamic";

export default async function EditLocationPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string; updated?: string }> }) {
  const { id } = await params;
  const [location, notice, roomsUsage] = await Promise.all([
    getLocationForEdit(id),
    searchParams,
    db.select({ id: rooms.id }).from(rooms).where(eq(rooms.locationId, id)).limit(1),
  ]);

  if (!location) notFound();
  const isAssigned = roomsUsage.length > 0;

  return (
    <div className={styles.narrowPage}>
      <Link href="/dashboard/settings?tab=locations" className={styles.backLink}>
        <ChevronLeft size={17} />
        Lokasi
      </Link>
      
      <header className={styles.editorHeader}>
        <h1>Edit lokasi</h1>
        <p>Perbarui detail bangunan atau lantai ini.</p>
        <div className={styles.roomTypeBadge}>
          <MapPin size={16} />
          <span>{location.name}</span>
        </div>
      </header>

      {notice.created ? (
        <div className={styles.successNotice}>Lokasi dibuat.</div>
      ) : notice.updated ? (
        <div className={styles.successNotice}>Lokasi diperbarui.</div>
      ) : null}

      <section className={styles.formPanel}>
        <LocationForm
          action={updateLocationAction.bind(null, id)}
          defaults={location}
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
            <h3>Hapus lokasi</h3>
            <p>Lokasi hanya dapat dihapus jika tidak lagi terhubung dengan kamar.</p>
            {isAssigned && (
              <Link href="/dashboard/settings?tab=room-types" className={styles.assignedLink}>
                <ExternalLink size={14} />
                <span>Lihat tipe kamar yang menggunakan lokasi ini</span>
              </Link>
            )}
          </div>
          <div className={styles.dangerZoneAction}>
            <DeleteControl
              action={deleteLocationAction.bind(null, id)}
              label="Hapus lokasi"
              confirmMessage={`Hapus ${location.name}? Tindakan ini tidak dapat dibatalkan.`}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

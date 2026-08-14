import Link from "next/link";
import { ChevronLeft, User, AlertTriangle, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { getStaffForEdit } from "@/modules/settings/queries";
import { db } from "@/db/client";
import { reservations } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { deleteStaffAction, updateStaffAction } from "../../actions";
import { DeleteControl } from "../../delete-control";
import { StaffForm } from "../../settings-forms";
import styles from "../../settings.module.css";

export const dynamic = "force-dynamic";

export default async function EditStaffPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string; updated?: string }> }) {
  const { id } = await params;
  const [staff, notice, createdReservations] = await Promise.all([
    getStaffForEdit(id),
    searchParams,
    db.select({ value: count() }).from(reservations).where(eq(reservations.createdBy, id)),
  ]);

  if (!staff) notFound();
  const isAssigned = (createdReservations?.[0]?.value ?? 0) > 0;

  return (
    <div className={styles.narrowPage}>
      <Link href="/dashboard/settings?tab=staff" className={styles.backLink}>
        <ChevronLeft size={17} />
        Staf
      </Link>
      
      <header className={styles.editorHeader}>
        <h1>Edit akun staf</h1>
        <p>Perbarui detail akses atau buat kata sandi baru.</p>
        <div className={styles.roomTypeBadge}>
          <User size={16} />
          <span>{staff.name}</span>
        </div>
      </header>

      {notice.created ? (
        <div className={styles.successNotice}>Akun staf dibuat.</div>
      ) : notice.updated ? (
        <div className={styles.successNotice}>Akun staf diperbarui.</div>
      ) : null}

      <section className={styles.formPanel}>
        <StaffForm
          action={updateStaffAction.bind(null, id)}
          defaults={staff}
          editing
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
            <h3>Hapus akun staf</h3>
            <p>Akun Anda sendiri, administrator terakhir, dan akun yang terkait dengan reservasi tidak dapat dihapus.</p>
            {isAssigned && (
              <Link href="/dashboard/reservations" className={styles.assignedLink}>
                <ExternalLink size={14} />
                <span>Lihat reservasi yang dibuat oleh staf ini</span>
              </Link>
            )}
          </div>
          <div className={styles.dangerZoneAction}>
            <DeleteControl
              action={deleteStaffAction.bind(null, id)}
              label="Hapus akun"
              confirmMessage={`Hapus akun ${staff.name}? Tindakan ini tidak dapat dibatalkan.`}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

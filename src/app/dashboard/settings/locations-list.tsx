import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { getLocationSettings } from "@/modules/settings/queries";
import styles from "./settings.module.css";

export function LocationsList({ locations }: { locations: Awaited<ReturnType<typeof getLocationSettings>> }) {
  return (
    <section className={styles.listPanel} aria-label="Daftar lokasi">
      <div className={styles.sectionContentHeader}>
        <h2>Lokasi</h2>
        <span>{locations.length} lokasi</span>
      </div>
      <div className={styles.listSummary}>{locations.length} lokasi</div>
      {locations.length ? (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Kamar</th>
                  <th>Deskripsi</th>
                  <th><span className={styles.srOnly}>Kelola</span></th>
                </tr>
              </thead>
              <tbody>
                {locations.map((loc) => (
                  <tr key={loc.id}>
                    <td><strong>{loc.name}</strong></td>
                    <td>{loc.roomTypeCount}</td>
                    <td className={styles.descriptionCell}>{loc.description ?? "—"}</td>
                    <td><Link href={`/dashboard/settings/locations/${loc.id}`}>Kelola</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className={styles.mobileCards}>
            {locations.map((loc) => (
              <Link className={styles.mobileLinkCard} href={`/dashboard/settings/locations/${loc.id}`} key={loc.id}>
                <div className={styles.mobileLinkCardContent}>
                  <strong>{loc.name}</strong>
                  <p>{loc.roomTypeCount} kamar</p>
                  <small>{loc.description ?? "Tidak ada deskripsi"}</small>
                </div>
                <ChevronRight size={18} className={styles.mobileChevron} />
              </Link>
            ))}
          </div>
        </>
      ) : (
        <div className={styles.empty}>
          <h2>Belum ada lokasi</h2>
          <p>Tambahkan lokasi seperti nama bangunan atau lantai.</p>
        </div>
      )}
    </section>
  );
}

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createLocationAction } from "../../actions";
import { LocationForm } from "../../settings-forms";
import styles from "../../settings.module.css";

export default function NewLocationPage() {
  return (
    <div className={styles.narrowPage}>
      <Link href="/dashboard/settings?tab=locations" className={styles.backLink}>
        <ChevronLeft size={17} />
        Lokasi
      </Link>
      <header className={styles.editorHeader}>
        <h1>Tambah lokasi</h1>
        <p>Kelola nama bangunan atau lantai tempat kamar berada.</p>
      </header>
      <section className={styles.formPanel}>
        <LocationForm action={createLocationAction} submitLabel="Buat lokasi" />
      </section>
    </div>
  );
}

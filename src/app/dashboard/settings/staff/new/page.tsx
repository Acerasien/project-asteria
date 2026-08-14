import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createStaffAction } from "../../actions";
import { StaffForm } from "../../settings-forms";
import styles from "../../settings.module.css";

export default function NewStaffPage() {
  return <div className={styles.narrowPage}><Link href="/dashboard/settings?tab=staff" className={styles.backLink}><ChevronLeft size={17} />Staf</Link><header className={styles.editorHeader}><h1>Tambah anggota staf</h1><p>Buat akun dan tetapkan hanya akses yang dibutuhkan orang ini.</p></header><section className={styles.formPanel}><StaffForm action={createStaffAction} submitLabel="Buat akun" /></section></div>;
}

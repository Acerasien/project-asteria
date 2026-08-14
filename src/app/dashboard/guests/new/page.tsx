import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createGuestAction } from "../actions";
import { GuestForm } from "../guest-form";
import styles from "../guests.module.css";

export default function NewGuestPage() {
  return <div className={styles.narrowPage}><Link href="/dashboard/guests" className={styles.backLink}><ChevronLeft size={17} />Tamu</Link><header className={styles.pageHeader}><div><h1>Tambah tamu</h1><p>Buat catatan tamu terlebih dahulu sebelum membuat reservasi.</p></div></header><section className={styles.formPanel}><GuestForm action={createGuestAction} submitLabel="Tambah tamu" cancelHref="/dashboard/guests" /></section></div>;
}


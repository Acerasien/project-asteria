import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getLocationOptions } from "@/modules/settings/queries";
import { createRoomTypeAction } from "../../actions";
import { RoomTypeForm } from "../../settings-forms";
import styles from "../../settings.module.css";

export default async function NewRoomTypePage() {
  const locations = await getLocationOptions();
  return <div className={styles.narrowPage}><Link href="/dashboard/settings?tab=room-types" className={styles.backLink}><ChevronLeft size={17} />Tipe kamar</Link><header className={styles.editorHeader}><h1>Tambah tipe kamar</h1><p>Buat kategori yang dapat ditugaskan ke kamar.</p></header><section className={styles.formPanel}><RoomTypeForm action={createRoomTypeAction} locations={locations} submitLabel="Buat tipe kamar" /></section></div>;
}

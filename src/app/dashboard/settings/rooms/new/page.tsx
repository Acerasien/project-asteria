import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getRoomTypeOptions } from "@/modules/settings/queries";
import { createRoomAction } from "../../actions";
import { RoomForm } from "../../settings-forms";
import styles from "../../settings.module.css";

export const dynamic = "force-dynamic";
export default async function NewRoomPage() {
  const roomTypes = await getRoomTypeOptions();
  return <div className={styles.narrowPage}><Link href="/dashboard/settings?tab=rooms" className={styles.backLink}><ChevronLeft size={17} />Kamar</Link><header className={styles.editorHeader}><h1>Tambah kamar</h1><p>Tambahkan kamar fisik ke inventaris hotel.</p></header>{roomTypes.length ? <section className={styles.formPanel}><RoomForm action={createRoomAction} roomTypes={roomTypes} submitLabel="Buat kamar" /></section> : <section className={styles.emptyPanel}><h2>Buat tipe kamar terlebih dahulu</h2><p>Setiap kamar memerlukan kategori sebelum dapat ditambahkan.</p><Link className={styles.primaryButton} href="/dashboard/settings/room-types/new">Tambah tipe kamar</Link></section>}</div>;
}

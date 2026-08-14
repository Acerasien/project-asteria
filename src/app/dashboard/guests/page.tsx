import Link from "next/link";
import { Plus, Search, Upload } from "lucide-react";
import { formatShortDate } from "@/lib/hotel-date";
import { getGuests, type GuestFilters } from "@/modules/guests/queries";
import styles from "./guests.module.css";

export const dynamic = "force-dynamic";

function pageHref(query: string, page: number) {
  const params = new URLSearchParams({ page: String(page) });
  if (query) params.set("query", query);
  return `/dashboard/guests?${params}`;
}

export default async function GuestsPage({ searchParams }: { searchParams: Promise<GuestFilters> }) {
  const params = await searchParams;
  const data = await getGuests(params);
  const importedCount = params.imported ? Number.parseInt(params.imported, 10) : undefined;

  return <div className={styles.page}>
    <header className={styles.pageHeader}>
      <div>
        <h1>Tamu</h1>
        <p>Cari catatan tamu, tinjau riwayat masa inap, dan perbarui detail kontak.</p>
      </div>
      <div style={{ display: "flex", gap: "var(--space-2)" }}>
        <Link href="/dashboard/guests/import" className={styles.secondaryButton}>
          <Upload size={17} aria-hidden="true" />
          Impor tamu
        </Link>
        <Link href="/dashboard/guests/new" className={styles.primaryButton}>
          <Plus size={17} aria-hidden="true" />
          Tambah tamu
        </Link>
      </div>
    </header>
    {importedCount ? (
      <div className={styles.successNotice}>
        {importedCount} catatan tamu berhasil diimpor.
      </div>
    ) : null}
    <form className={styles.filters} method="get">
      <label className={styles.searchField}><Search size={17} aria-hidden="true" /><span className={styles.srOnly}>Cari tamu</span><input type="search" name="query" defaultValue={data.query} placeholder="Nama, email, telepon, atau nomor identitas" /></label>
      <button className={styles.secondaryButton} type="submit">Cari</button>
      {data.query ? <Link className={styles.clearLink} href="/dashboard/guests">Bersihkan</Link> : null}
    </form>
    <section className={styles.listPanel} aria-label="Hasil tamu">
      <div className={styles.listSummary}><span>{data.total} tamu</span><span>Halaman {data.page} dari {data.pages}</span></div>
      {data.rows.length ? <>
        <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Tamu</th><th>Telepon</th><th>Email</th><th>Nomor identitas</th><th>Kunjungan</th><th>Kunjungan terakhir</th><th><span className={styles.srOnly}>Buka</span></th></tr></thead><tbody>{data.rows.map((guest) => <tr key={guest.id}><td><strong>{guest.fullName}</strong></td><td>{guest.phone}</td><td>{guest.email ?? "—"}</td><td>{guest.idNumber}</td><td>{guest.totalStays}</td><td>{guest.lastStayDate ? formatShortDate(guest.lastStayDate) : "—"}</td><td><Link href={`/dashboard/guests/${guest.id}`} aria-label={`Buka ${guest.fullName}`}>Lihat</Link></td></tr>)}</tbody></table></div>
        <div className={styles.mobileRecords}>{data.rows.map((guest) => <Link href={`/dashboard/guests/${guest.id}`} className={styles.mobileRecord} key={guest.id}><span><strong>{guest.fullName}</strong><small>{guest.phone}</small></span><span><strong>{guest.totalStays} kunjungan</strong><small>{guest.lastStayDate ? `Terakhir: ${formatShortDate(guest.lastStayDate)}` : "Belum ada kunjungan"}</small></span></Link>)}</div>
      </> : <div className={styles.empty}><h2>Tamu tidak ditemukan</h2><p>{data.query ? "Coba nama, telepon, email, atau nomor identitas lain." : "Tambahkan catatan tamu pertama untuk mulai menerima reservasi."}</p>{!data.query ? <Link href="/dashboard/guests/new">Tambah tamu</Link> : null}</div>}
      {data.pages > 1 ? <nav className={styles.pagination} aria-label="Halaman tamu">{data.page > 1 ? <Link href={pageHref(data.query, data.page - 1)}>Sebelumnya</Link> : <span>Sebelumnya</span>}{data.page < data.pages ? <Link href={pageHref(data.query, data.page + 1)}>Berikutnya</Link> : <span>Berikutnya</span>}</nav> : null}
    </section>
  </div>;
}


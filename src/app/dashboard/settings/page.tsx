import Link from "next/link";
import { Plus, ChevronRight } from "lucide-react";
import { getRoomSettings, getRoomTypeSettings, getStaffSettings, getLocationSettings, parseSettingsTab, type SettingsTab } from "@/modules/settings/queries";
import { RoomsList } from "./rooms-list";
import { LocationsList } from "./locations-list";
import { SettingsMobileNav } from "./settings-nav";
import { WipeDatabaseZone } from "./wipe-database-zone";
import styles from "./settings.module.css";

export const dynamic = "force-dynamic";

const tabCopy: Record<SettingsTab, { label: string; description: string; addLabel: string; addHref: string }> = {
  "room-types": { label: "Kamar", description: "Tentukan kamar dan lokasi untuk inventaris Anda.", addLabel: "Tambah kamar", addHref: "/dashboard/settings/room-types/new" },
  locations: { label: "Lokasi", description: "Kelola daftar lokasi bangunan atau lantai.", addLabel: "Tambah lokasi", addHref: "/dashboard/settings/locations/new" },
  rooms: { label: "Kasur", description: "Kelola inventaris kasur dan terapkan perubahan status operasional secara massal.", addLabel: "Tambah kasur", addHref: "/dashboard/settings/rooms/new" },
  staff: { label: "Staf", description: "Kontrol akses staf dan tetapkan izin yang sesuai untuk setiap peran.", addLabel: "Tambah anggota staf", addHref: "/dashboard/settings/staff/new" },
};

function roleLabel(role: "ADMIN" | "FRONT_DESK" | "HOUSEKEEPING") { return { ADMIN: "Administrator", FRONT_DESK: "Resepsionis", HOUSEKEEPING: "Housekeeping" }[role]; }

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string | string[]; deleted?: string }> }) {
  const params = await searchParams;
  const tab = parseSettingsTab(params.tab);
  const data = tab === "room-types" ? await getRoomTypeSettings() : tab === "rooms" ? await getRoomSettings() : tab === "locations" ? await getLocationSettings() : await getStaffSettings();
  const copy = tabCopy[tab];
  
  return <div className={styles.page}>
    <header className={styles.pageHeader}>
      <div>
        <span>Administrasi</span>
        <h1>Pengaturan</h1>
        <p>{copy.description}</p>
      </div>
      <Link href={copy.addHref} className={styles.primaryButton}>
        <Plus size={17} aria-hidden="true" />
        {copy.addLabel}
      </Link>
    </header>
    
    <nav className={styles.tabs} aria-label="Bagian pengaturan">
      {(Object.keys(tabCopy) as SettingsTab[]).map((key) => (
        <Link href={`/dashboard/settings?tab=${key}`} aria-current={key === tab ? "page" : undefined} key={key}>
          {tabCopy[key].label}
        </Link>
      ))}
    </nav>

    <div className={styles.mobileNavRow}>
      <SettingsMobileNav currentTab={tab} />
      <Link href={copy.addHref} className={styles.mobileCreateButton} aria-label={copy.addLabel}>
        <Plus size={16} aria-hidden="true" />
        <span>Tambah</span>
      </Link>
    </div>

    {params.deleted ? <div className={styles.successNotice}>Catatan telah dihapus.</div> : null}
    
    {tab === "rooms" ? (
      <RoomsList rooms={data as Awaited<ReturnType<typeof getRoomSettings>>} />
    ) : tab === "locations" ? (
      <LocationsList locations={data as Awaited<ReturnType<typeof getLocationSettings>>} />
    ) : tab === "room-types" ? (
      <section className={styles.listPanel} aria-label="Tipe kamar">
        <div className={styles.sectionContentHeader}>
          <h2>Kamar</h2>
          <span>{data.length} kamar</span>
        </div>
        <div className={styles.listSummary}>{data.length} kamar</div>
        {data.length ? (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Lokasi</th>
                    <th>Kasur</th>
                    <th>Deskripsi</th>
                    <th><span className={styles.srOnly}>Kelola</span></th>
                  </tr>
                </thead>
                <tbody>
                  {(data as Awaited<ReturnType<typeof getRoomTypeSettings>>).map((type) => (
                    <tr key={type.id}>
                      <td>
                        <strong>{type.name}</strong>
                        {type.isMixedGender ? <span className={styles.mixedBadge}>Bisa Campur</span> : null}
                      </td>
                      <td>{type.locationName ?? "—"}</td>
                      <td>{type.roomCount}</td>
                      <td className={styles.descriptionCell}>{type.description ?? "—"}</td>
                      <td><Link href={`/dashboard/settings/room-types/${type.id}`}>Kelola</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className={styles.mobileCards}>
              {(data as Awaited<ReturnType<typeof getRoomTypeSettings>>).map((type) => (
                <Link className={styles.mobileLinkCard} href={`/dashboard/settings/room-types/${type.id}`} key={type.id}>
                  <div className={styles.mobileLinkCardContent}>
                    <strong>
                      {type.name}
                      {type.isMixedGender ? <span className={styles.mixedBadge}>Bisa Campur</span> : null}
                    </strong>
                    <p>{type.locationName ?? "—"} · {type.roomCount} kasur</p>
                    <small>{type.description ?? "Tidak ada deskripsi"}</small>
                  </div>
                  <ChevronRight size={18} className={styles.mobileChevron} />
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className={styles.empty}>
            <h2>Belum ada kamar</h2>
            <p>Buat kamar sebelum menambahkan kasur.</p>
          </div>
        )}
      </section>
    ) : (
      <>
        <section className={styles.listPanel} aria-label="Akun staf">
          <div className={styles.sectionContentHeader}>
            <h2>Staf</h2>
            <span>{data.length} akun staf</span>
          </div>
          <div className={styles.listSummary}>{data.length} akun staf</div>
          {data.length ? (
            <>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Nama</th>
                      <th>Email</th>
                      <th>Peran</th>
                      <th>Reservasi dibuat</th>
                      <th><span className={styles.srOnly}>Kelola</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data as Awaited<ReturnType<typeof getStaffSettings>>).map((staff) => (
                      <tr key={staff.id}>
                        <td><strong>{staff.name}</strong></td>
                        <td>{staff.email}</td>
                        <td>
                          <span className={styles.roleBadge} data-role={staff.role}>
                            {roleLabel(staff.role)}
                          </span>
                        </td>
                        <td>{staff.reservationCount}</td>
                        <td><Link href={`/dashboard/settings/staff/${staff.id}`}>Kelola</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className={styles.mobileCards}>
                {(data as Awaited<ReturnType<typeof getStaffSettings>>).map((staff) => (
                  <Link className={styles.mobileLinkCard} href={`/dashboard/settings/staff/${staff.id}`} key={staff.id}>
                    <div className={styles.mobileLinkCardContent}>
                      <strong>{staff.name}</strong>
                      <p>{staff.email} · <span className={styles.roleBadge} data-role={staff.role}>{roleLabel(staff.role)}</span></p>
                      <small>{staff.reservationCount} reservasi dibuat</small>
                    </div>
                    <ChevronRight size={18} className={styles.mobileChevron} />
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className={styles.empty}>
              <h2>Belum ada akun staf</h2>
              <p>Tambahkan akun untuk memberikan akses ke operasional hotel.</p>
            </div>
          )}
        </section>
        <WipeDatabaseZone />
      </>
    )}
  </div>;
}

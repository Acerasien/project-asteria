"use client";

import { useRouter } from "next/navigation";
import styles from "./settings.module.css";

export function SettingsMobileNav({ currentTab }: { currentTab: string }) {
  const router = useRouter();

  return (
    <div className={styles.mobileSelector}>
      <select
        value={currentTab}
        onChange={(e) => {
          router.push(`/dashboard/settings?tab=${e.target.value}`);
        }}
        aria-label="Pilih kategori pengaturan"
      >
        <option value="room-types">Tipe kamar</option>
        <option value="rooms">Kamar</option>
        <option value="staff">Staf</option>
      </select>
      <span className={styles.mobileSelectorChevron} aria-hidden="true">▾</span>
    </div>
  );
}

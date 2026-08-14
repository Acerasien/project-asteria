import styles from "./settings.module.css";

export default function SettingsLoading() {
  return <div className={styles.page} aria-label="Memuat pengaturan"><div className={styles.loadingHeader} /><div className={styles.loadingTabs} /><div className={styles.loadingPanel} /></div>;
}

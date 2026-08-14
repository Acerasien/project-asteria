import styles from "./loading.module.css";

export default function DashboardLoading() {
  return (
    <div className={styles.page} aria-label="Memuat dashboard">
      <div className={styles.heading} />
      <div className={styles.stats}>{Array.from({ length: 4 }, (_, index) => <div key={index} className={styles.stat} />)}</div>
      <div className={styles.panels}><div /><div /></div>
      <div className={styles.attention} />
    </div>
  );
}

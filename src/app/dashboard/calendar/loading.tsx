import styles from "./calendar.module.css";

export default function CalendarLoading() {
  return <div className={styles.page} aria-label="Memuat kalender kamar">
    <div className={styles.loadingHeader}><span /><span /></div>
    <div className={styles.loadingControls} />
    <div className={styles.loadingGrid}>{Array.from({ length: 12 }, (_, index) => <span key={index} />)}</div>
  </div>;
}


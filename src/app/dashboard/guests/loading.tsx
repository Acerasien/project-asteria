import styles from "./guests.module.css";

export default function GuestsLoading() {
  return <div className={styles.page} aria-label="Memuat tamu"><div className={styles.loadingHeader}><span /><span /></div><div className={styles.loadingSearch} /><div className={styles.loadingRows}>{Array.from({ length: 8 }, (_, index) => <span key={index} />)}</div></div>;
}


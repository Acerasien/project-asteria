import styles from "./housekeeping.module.css";

export default function HousekeepingLoading() {
  return <div className={styles.page} aria-label="Memuat papan housekeeping"><div className={styles.loadingHeader}><span /><span /></div><div className={styles.loadingTabs} />{Array.from({ length: 2 }, (_, floor) => <div className={styles.loadingFloor} key={floor}><span /> <div>{Array.from({ length: 8 }, (_, room) => <span key={room} />)}</div></div>)}</div>;
}


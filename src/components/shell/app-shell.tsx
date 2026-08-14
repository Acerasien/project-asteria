import { Building2, LogOut } from "lucide-react";
import type { Session } from "next-auth";
import { logout } from "@/app/dashboard/logout-action";
import { formatHotelDay } from "@/lib/hotel-date";
import { Navigation } from "./navigation";
import styles from "./shell.module.css";

function roleLabel(role: Session["user"]["role"]) {
  return { ADMIN: "Administrator", FRONT_DESK: "Resepsionis", HOUSEKEEPING: "Housekeeping" }[role];
}

export function AppShell({ session, children }: { session: Session; children: React.ReactNode }) {
  const initials = session.user.name
    ?.split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className={styles.shell}>
      <a href="#main-content" className={styles.skipLink}>Lewati ke konten utama</a>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandMark}><Building2 size={20} aria-hidden="true" /></span>
          <span className={styles.brandText}>Operasional Hotel</span>
        </div>
        <Navigation role={session.user.role} />
        <form action={logout} className={styles.logoutForm}>
          <button type="submit" className={styles.logoutButton}>
            <LogOut size={19} aria-hidden="true" />
            <span>Keluar</span>
          </button>
        </form>
      </aside>
      <div className={styles.workspace}>
        <header className={styles.topbar}>
          <div>
            <p className={styles.mobileBrand}>Operasional Hotel</p>
            <p className={styles.date}>{formatHotelDay()}</p>
          </div>
          <div className={styles.user}>
            <span className={styles.avatar} aria-hidden="true">{initials || "ST"}</span>
            <span className={styles.userCopy}>
              <strong>{session.user.name}</strong>
              <span>{roleLabel(session.user.role)}</span>
            </span>
          </div>
        </header>
        <main id="main-content" className={styles.main}>{children}</main>
      </div>
    </div>
  );
}

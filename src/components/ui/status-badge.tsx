import { CircleAlert, CircleCheck, CircleMinus, Clock3, Sparkles, Wrench } from "lucide-react";
import styles from "./status-badge.module.css";

type Status =
  | "CONFIRMED"
  | "CHECKED_IN"
  | "CHECKED_OUT"
  | "CANCELLED"
  | "CLEAN"
  | "DIRTY"
  | "MAINTENANCE"
  | "OUT_OF_ORDER";

const statusConfig = {
  CONFIRMED: { label: "Dikonfirmasi", icon: Clock3 },
  CHECKED_IN: { label: "Sudah Check-In", icon: CircleCheck },
  CHECKED_OUT: { label: "Sudah Check-Out", icon: CircleMinus },
  CANCELLED: { label: "Dibatalkan", icon: CircleMinus },
  CLEAN: { label: "Bersih", icon: Sparkles },
  DIRTY: { label: "Kotor", icon: CircleAlert },
  MAINTENANCE: { label: "Pemeliharaan", icon: Wrench },
  OUT_OF_ORDER: { label: "Rusak", icon: CircleMinus },
} satisfies Record<Status, { label: string; icon: typeof Clock3 }>;

export function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    <span className={styles.badge} data-status={status}>
      <Icon aria-hidden="true" size={14} strokeWidth={2} />
      {config.label}
    </span>
  );
}

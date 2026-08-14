"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BedDouble,
  CalendarDays,
  ClipboardCheck,
  DoorOpen,
  LayoutDashboard,
  Settings,
  UsersRound,
} from "lucide-react";
import type { StaffRole } from "@/lib/permissions";
import styles from "./shell.module.css";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "FRONT_DESK", "HOUSEKEEPING"] },
  { href: "/dashboard/calendar", label: "Kalender", icon: CalendarDays, roles: ["ADMIN", "FRONT_DESK"] },
  { href: "/dashboard/rooms", label: "Status Kamar", icon: DoorOpen, roles: ["ADMIN", "FRONT_DESK"] },
  { href: "/dashboard/reservations", label: "Reservasi", icon: BedDouble, roles: ["ADMIN", "FRONT_DESK"] },
  { href: "/dashboard/guests", label: "Tamu", icon: UsersRound, roles: ["ADMIN", "FRONT_DESK"] },
  { href: "/dashboard/housekeeping", label: "Housekeeping", icon: ClipboardCheck, roles: ["ADMIN", "FRONT_DESK", "HOUSEKEEPING"] },
  { href: "/dashboard/settings", label: "Pengaturan", icon: Settings, roles: ["ADMIN"] },
] satisfies Array<{ href: string; label: string; icon: typeof LayoutDashboard; roles: StaffRole[] }>;

export function Navigation({ role }: { role: StaffRole }) {
  const pathname = usePathname();
  const allowed = navigation.filter((item) => item.roles.includes(role));

  return (
    <>
      <nav className={styles.sideNavigation} aria-label="Primary navigation">
        {allowed.map((item) => {
          const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={styles.navLink} aria-current={active ? "page" : undefined}>
              <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <nav className={styles.bottomNavigation} aria-label="Mobile navigation">
        {allowed.map((item) => {
          const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={styles.bottomLink} aria-current={active ? "page" : undefined}>
              <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

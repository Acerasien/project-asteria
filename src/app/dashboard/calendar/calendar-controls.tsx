"use client";

import { useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { addCalendarDays, type CalendarDayCount } from "@/modules/calendar/date-window";
import styles from "./calendar.module.css";

type RoomStatus = "CLEAN" | "DIRTY" | "MAINTENANCE" | "OUT_OF_ORDER";

export function CalendarControls({ start, days, location, status, locations }: { start: string; days: CalendarDayCount; location?: string; status?: RoomStatus; locations: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentParams = useSearchParams();

  const navigate = useCallback((updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(currentParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }, [currentParams, pathname, router]);

  const shift = useCallback((amount: number) => navigate({ start: addCalendarDays(start, amount) }), [navigate, start]);
  const today = useCallback(() => navigate({ start: undefined }), [navigate]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable || target?.closest("input, select, textarea, button, a")) return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === "ArrowLeft") { event.preventDefault(); shift(-1); }
      if (event.key === "ArrowRight") { event.preventDefault(); shift(1); }
      if (event.key.toLowerCase() === "t") { event.preventDefault(); today(); }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shift, today]);

  return <div className={styles.controls}>
    <div className={styles.dateControls}>
      <button type="button" onClick={() => shift(-1)} aria-label="Hari sebelumnya" aria-keyshortcuts="ArrowLeft"><ChevronLeft size={18} /></button>
      <button type="button" onClick={today} aria-keyshortcuts="T">Hari ini</button>
      <button type="button" onClick={() => shift(1)} aria-label="Hari berikutnya" aria-keyshortcuts="ArrowRight"><ChevronRight size={18} /></button>
      <label className={styles.datePicker}><span>Tanggal mulai</span><input type="date" value={start} onChange={(event) => navigate({ start: event.target.value })} /></label>
    </div>

    <div className={styles.viewToggle} aria-label="Rentang kalender">
      {([7, 14, 30] as const).map((count) => <button type="button" key={count} aria-pressed={days === count} onClick={() => navigate({ days: String(count) })}>{count} hari</button>)}
    </div>

    <div className={styles.filters}>
      <label><span>Lokasi</span><select value={location ?? ""} onChange={(event) => navigate({ location: event.target.value || undefined })}><option value="">Semua lokasi</option>{locations.filter(Boolean).map((value) => <option value={value} key={value}>{value}</option>)}</select></label>
      <label><span>Status kamar</span><select value={status ?? ""} onChange={(event) => navigate({ status: event.target.value || undefined })}><option value="">Semua status</option><option value="CLEAN">Bersih</option><option value="DIRTY">Kotor</option><option value="MAINTENANCE">Pemeliharaan</option><option value="OUT_OF_ORDER">Rusak</option></select></label>
    </div>
  </div>;
}

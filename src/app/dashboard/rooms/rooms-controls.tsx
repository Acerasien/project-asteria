"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { addCalendarDays } from "@/modules/calendar/date-window";
import styles from "./rooms.module.css";

interface RoomsControlsProps {
  currentDate: string;
  initialSearch: string;
}

export function RoomsControls({ currentDate, initialSearch }: RoomsControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchVal, setSearchVal] = useState(initialSearch);

  useEffect(() => {
    setSearchVal(initialSearch);
  }, [initialSearch]);

  const navigate = useCallback((updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(currentParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        if (value.trim()) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }, [currentParams, pathname, router]);

  const shift = useCallback((amount: number) => {
    navigate({ date: addCalendarDays(currentDate, amount) });
  }, [navigate, currentDate]);

  const today = useCallback(() => {
    navigate({ date: undefined });
  }, [navigate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ search: searchVal });
  };

  const handleSearchClear = () => {
    setSearchVal("");
    navigate({ search: "" });
  };

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

  return (
    <div className={styles.controls} data-pending={isPending || undefined}>
      <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
        <div className={styles.searchField}>
          <Search size={17} aria-hidden="true" />
          <input
            type="search"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Cari kamar, lokasi, atau tamu..."
            aria-label="Cari kamar atau tamu"
          />
        </div>
        <button type="submit" className={styles.searchButton}>Cari</button>
        {initialSearch ? (
          <button type="button" onClick={handleSearchClear} className={styles.clearButton}>
            Bersihkan
          </button>
        ) : null}
      </form>

      <div className={styles.dateControls}>
        <button type="button" onClick={() => shift(-1)} aria-label="Hari sebelumnya" aria-keyshortcuts="ArrowLeft">
          <ChevronLeft size={18} />
        </button>
        <button type="button" onClick={today} aria-keyshortcuts="T">Hari ini</button>
        <button type="button" onClick={() => shift(1)} aria-label="Hari berikutnya" aria-keyshortcuts="ArrowRight">
          <ChevronRight size={18} />
        </button>
        <label className={styles.datePicker}>
          <span>Tanggal</span>
          <input
            type="date"
            value={currentDate}
            onChange={(event) => navigate({ date: event.target.value })}
          />
        </label>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Search, X, Loader2, Plus, User } from "lucide-react";
import styles from "./reservations.module.css";

type GuestOption = {
  id: string;
  name: string;
  phone: string;
  gender: "MALE" | "FEMALE";
  idNumber: string;
};

type GuestComboboxProps = {
  guests: GuestOption[];
  selectedGuest: GuestOption | null;
  onSelect: (guest: GuestOption | null) => void;
  searchAction: (query: string) => Promise<GuestOption[]>;
  error?: string;
};

export function GuestCombobox({
  guests: initialGuests,
  selectedGuest,
  onSelect,
  searchAction,
  error,
}: GuestComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GuestOption[]>(initialGuests);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isPending, startTransition] = useTransition();

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Set initial input query when a guest is selected or changed externally
  useEffect(() => {
    if (selectedGuest) {
      setQuery(selectedGuest.name);
    } else {
      setQuery("");
    }
  }, [selectedGuest]);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Reset query if nothing selected, or restore selected name
        setQuery(selectedGuest ? selectedGuest.name : "");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedGuest]);

  // Debounced search logic
  const handleInputChange = (val: string) => {
    setQuery(val);
    setIsOpen(true);
    setHighlightedIndex(-1);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      startTransition(async () => {
        try {
          const res = await searchAction(val);
          setResults(res);
        } catch (err) {
          console.error("Gagal memuat pencarian tamu", err);
        }
      });
    }, 250);
  };

  const handleSelect = (guest: GuestOption) => {
    onSelect(guest);
    setQuery(guest.name);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(null);
    setQuery("");
    setResults(initialGuests);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        setIsOpen(false);
        setQuery(selectedGuest ? selectedGuest.name : "");
        break;
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1 < results.length ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < results.length) {
          handleSelect(results[highlightedIndex]!);
        }
        break;
    }
  };

  return (
    <div className={styles.comboboxContainer} ref={containerRef}>
      <input type="hidden" name="guestId" value={selectedGuest?.id ?? ""} />
      <div
        className={styles.comboboxInputWrapper}
        data-invalid={Boolean(error)}
        data-focus={isOpen}
      >
        <Search size={16} className={styles.searchIcon} />
        <input
          ref={inputRef}
          type="text"
          placeholder="Cari nama, telepon, atau nomor KTP..."
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        {isPending && <Loader2 size={16} className={styles.loadingSpinner} />}
        {!isPending && selectedGuest && (
          <button type="button" onClick={handleClear} className={styles.clearBtn} aria-label="Hapus pilihan">
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className={styles.comboboxDropdown}>
          {results.length > 0 ? (
            <ul className={styles.comboboxList} role="listbox">
              {results.map((guest, idx) => (
                <li
                  key={guest.id}
                  role="option"
                  aria-selected={guest.id === selectedGuest?.id}
                  className={styles.comboboxListItem}
                  data-highlighted={idx === highlightedIndex}
                  data-selected={guest.id === selectedGuest?.id}
                  onClick={() => handleSelect(guest)}
                >
                  <User size={14} className={styles.listItemIcon} />
                  <div className={styles.listItemDetails}>
                    <strong>{guest.name}</strong>
                    <span>
                      {guest.gender === "MALE" ? "Laki-laki" : "Perempuan"} · {guest.phone}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.comboboxNoResults}>
              Tamu tidak ditemukan
            </div>
          )}

          <div className={styles.comboboxFooter}>
            <a
              href={`/dashboard/guests/new?name=${encodeURIComponent(query)}`}
              className={styles.comboboxAddLink}
            >
              <Plus size={14} />
              <span>Tambah Tamu Baru "{query || "..."}"</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

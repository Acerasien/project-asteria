"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import type { ReservationActionState } from "./actions";
import styles from "./reservations.module.css";

import { searchGuestsAction } from "./actions";
import { GuestCombobox } from "./guest-combobox";

const statusLabels: Record<string, string> = {
  CLEAN: "bersih",
  DIRTY: "kotor",
  MAINTENANCE: "pemeliharaan",
  OUT_OF_ORDER: "rusak",
};

type OptionData = {
  guests: { id: string; name: string; phone: string; gender: "MALE" | "FEMALE"; idNumber: string }[];
  rooms: { id: string; roomId: string; number: string; floor: string | null; status: "CLEAN" | "DIRTY" | "MAINTENANCE" | "OUT_OF_ORDER"; type: string; isMixedGender?: boolean }[];
  bookings?: { id: string; bedId: string; roomId: string; guestGender: "MALE" | "FEMALE"; checkInDate: string; checkOutDate: string }[];
};

type Defaults = {
  id?: string;
  guestId?: string;
  roomId?: string;
  checkInDate?: string;
  checkOutDate?: string;
  notes?: string | null;
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <button className={styles.primaryButton} type="submit" disabled={pending}>{pending ? "Menyimpan…" : label}</button>;
}

export function ReservationForm({
  action,
  options,
  defaults = {},
  submitLabel,
  cancelHref,
}: {
  action: (state: ReservationActionState, formData: FormData) => Promise<ReservationActionState>;
  options: OptionData;
  defaults?: Defaults;
  submitLabel: string;
  cancelHref: string;
}) {
  const [state, formAction] = useActionState(action, { status: "idle" } satisfies ReservationActionState);
  const error = (field: string) => state.fieldErrors?.[field]?.[0];

  const [selectedGuestId, setSelectedGuestId] = useState<string>(defaults.guestId ?? "");
  const [checkInDate, setCheckInDate] = useState<string>(defaults.checkInDate ?? "");
  const [checkOutDate, setCheckOutDate] = useState<string>(defaults.checkOutDate ?? "");
  const [selectedRoomId, setSelectedRoomId] = useState<string>(defaults.roomId ?? "");

  const selectedGuest = useMemo(
    () => options.guests.find((g) => g.id === selectedGuestId),
    [options.guests, selectedGuestId],
  );

  const availableRooms = useMemo(() => {
    if (!checkInDate || !checkOutDate || checkOutDate <= checkInDate) {
      return options.rooms;
    }
    return options.rooms.filter((room) => {
      // 1. Bed must not be occupied directly on these dates
      const isBedOccupied = (options.bookings ?? []).some(
        (b) =>
          b.bedId === room.id &&
          b.id !== defaults.id &&
          checkInDate < b.checkOutDate &&
          checkOutDate > b.checkInDate,
      );
      if (isBedOccupied) return false;

      // 2. If a guest is selected and the room is NOT mixed gender, check for gender lock
      if (selectedGuest && !room.isMixedGender) {
        const hasOppositeGenderBooking = (options.bookings ?? []).some(
          (b) =>
            b.roomId === room.roomId &&
            b.id !== defaults.id &&
            b.guestGender !== selectedGuest.gender &&
            checkInDate < b.checkOutDate &&
            checkOutDate > b.checkInDate,
        );
        if (hasOppositeGenderBooking) return false;
      }

      return true;
    });
  }, [options.rooms, options.bookings, checkInDate, checkOutDate, selectedGuest, defaults.id]);

  const effectiveSelectedRoom = availableRooms.some((r) => r.id === selectedRoomId) ? selectedRoomId : "";

  return (
    <form action={formAction} className={styles.form}>
      {state.message ? <div className={styles.formMessage} data-status={state.status} role="alert">{state.message}</div> : null}
      <div className={styles.formGrid}>
        <div className={styles.field}>
          <span>Tamu {selectedGuest ? <em>({selectedGuest.gender === "MALE" ? "Laki-laki" : "Perempuan"})</em> : null}</span>
          <GuestCombobox
            guests={options.guests}
            selectedGuestId={selectedGuestId}
            onSelect={(guest) => setSelectedGuestId(guest ? guest.id : "")}
            searchAction={searchGuestsAction}
            error={error("guestId")}
          />
          {error("guestId") ? <small>{error("guestId")}</small> : null}
        </div>

        <label className={styles.field}>
          <span>Kasur {availableRooms.length < options.rooms.length ? <em>({availableRooms.length} tersedia)</em> : null}</span>
          <select
            name="roomId"
            value={effectiveSelectedRoom}
            onChange={(e) => setSelectedRoomId(e.target.value)}
            aria-invalid={Boolean(error("roomId"))}
            required
          >
            <option value="" disabled>
              {availableRooms.length === 0
                ? selectedGuest
                  ? "Tidak ada kasur kosong yang sesuai dengan gender tamu pada tanggal ini"
                  : "Tidak ada kasur tersedia untuk tanggal ini"
                : "Pilih kasur"}
            </option>
            {availableRooms.map((room) => (
              <option value={room.id} key={room.id}>
                Kasur {room.number} · {room.type}{room.floor ? ` (${room.floor})` : ""}{room.isMixedGender ? " · [Bisa Campur]" : ""} · {statusLabels[room.status]}
              </option>
            ))}
          </select>
          <small className={styles.hint}>
            {availableRooms.length === 0
              ? selectedGuest
                ? "Semua kasur terisi atau berada di kamar yang terkunci gender lain."
                : "Semua kasur telah terisi pada rentang tanggal ini."
              : selectedGuest
                ? `Hanya menampilkan kasur kosong di kamar yang tersedia untuk tamu ${selectedGuest.gender === "MALE" ? "laki-laki" : "perempuan"} (atau kamar Bisa Campur).`
                : "Hanya kasur yang belum terisi pada tanggal menginap yang ditampilkan."}
          </small>
          {error("roomId") ? <small>{error("roomId")}</small> : null}
        </label>

        <label className={styles.field}>
          <span>Check-in</span>
          <input
            name="checkInDate"
            type="date"
            value={checkInDate}
            onChange={(e) => setCheckInDate(e.target.value)}
            aria-invalid={Boolean(error("checkInDate"))}
            required
          />
          {error("checkInDate") ? <small>{error("checkInDate")}</small> : null}
        </label>

        <label className={styles.field}>
          <span>Check-out</span>
          <input
            name="checkOutDate"
            type="date"
            value={checkOutDate}
            onChange={(e) => setCheckOutDate(e.target.value)}
            aria-invalid={Boolean(error("checkOutDate"))}
            required
          />
          {error("checkOutDate") ? <small>{error("checkOutDate")}</small> : null}
        </label>
      </div>

      <label className={styles.field}>
        <span>Catatan internal <em>Opsional</em></span>
        <textarea name="notes" rows={4} maxLength={1000} defaultValue={defaults.notes ?? ""} placeholder="Detail kedatangan, preferensi, atau catatan serah terima" />
        {error("notes") ? <small>{error("notes")}</small> : null}
      </label>

      <div className={styles.formActions}>
        <Link className={styles.secondaryButton} href={cancelHref}>Batal</Link>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}


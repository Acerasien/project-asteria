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
  rooms: { id: string; roomId: string; number: string; floor: string | null; status: "CLEAN" | "DIRTY" | "MAINTENANCE" | "OUT_OF_ORDER"; type: string; isMixedGender?: boolean; isTemporary?: boolean; isActive?: boolean }[];
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

  const [selectedGuest, setSelectedGuest] = useState<OptionData["guests"][number] | null>(() => {
    return options.guests.find((g) => g.id === defaults.guestId) ?? null;
  });
  const selectedGuestId = selectedGuest?.id ?? "";
  const [checkInDate, setCheckInDate] = useState<string>(defaults.checkInDate ?? "");
  const [checkOutDate, setCheckOutDate] = useState<string>(defaults.checkOutDate ?? "");
  const [selectedRoomId, setSelectedRoomId] = useState<string>(defaults.roomId ?? "");

  const availableRooms = useMemo(() => {
    const isRoomActive = (room: OptionData["rooms"][number]) => room.isActive || room.id === defaults.roomId;

    if (!checkInDate || !checkOutDate || checkOutDate <= checkInDate) {
      return options.rooms.filter(isRoomActive);
    }
    return options.rooms.filter((room) => {
      if (!isRoomActive(room)) return false;

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
  }, [options.rooms, options.bookings, checkInDate, checkOutDate, selectedGuest, defaults.id, defaults.roomId]);

  const effectiveSelectedRoom = availableRooms.some((r) => r.id === selectedRoomId) ? selectedRoomId : "";

  const groupedRooms = useMemo(() => {
    const groups: Record<string, {
      roomName: string;
      floor: string | null;
      isMixedGender: boolean;
      beds: typeof availableRooms;
    }> = {};

    availableRooms.forEach((bed) => {
      const key = bed.roomId;
      if (!groups[key]) {
        groups[key] = {
          roomName: bed.type,
          floor: bed.floor,
          isMixedGender: Boolean(bed.isMixedGender),
          beds: [],
        };
      }
      groups[key].beds.push(bed);
    });

    return Object.values(groups);
  }, [availableRooms]);

  return (
    <form action={formAction} className={styles.form}>
      {state.message ? <div className={styles.formMessage} data-status={state.status} role="alert">{state.message}</div> : null}
      <div className={styles.formGrid}>
        <div className={styles.field}>
          <span>Tamu {selectedGuest ? <em>({selectedGuest.gender === "MALE" ? "Laki-laki" : "Perempuan"})</em> : null}</span>
          <GuestCombobox
            guests={options.guests}
            selectedGuest={selectedGuest}
            onSelect={setSelectedGuest}
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
            {groupedRooms.map((group) => (
              <optgroup
                label={`${group.roomName}${group.floor ? ` (${group.floor})` : ""}${group.isMixedGender ? " · [Bisa Campur]" : ""}`}
                key={group.roomName}
              >
                {group.beds.map((bed) => {
                  const normalizedNumber = bed.number.toLowerCase().startsWith("kasur")
                    ? bed.number
                    : `Kasur ${bed.number}`;
                  const bedLabel = `${normalizedNumber}${bed.isTemporary ? " (Sementara)" : ""}`;
                  return (
                    <option value={bed.id} key={bed.id}>
                      {bedLabel} · {statusLabels[bed.status]}
                    </option>
                  );
                })}
              </optgroup>
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


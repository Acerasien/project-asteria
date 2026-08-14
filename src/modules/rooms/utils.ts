export interface RoomBedRow {
  bedId: string;
  bedNumber: string;
  bedStatus: string;
  roomId: string;
  roomName: string;
  locationName: string | null;
  isMixedGender: boolean;
  reservationId: string | null;
  bookingCode: string | null;
  reservationStatus: string | null;
  guestId: string | null;
  guestName: string | null;
  checkInDate: string | null;
  checkOutDate: string | null;
}

export interface BedData {
  id: string;
  number: string;
  status: string;
  reservation: {
    id: string;
    bookingCode: string;
    status: string;
    guestId: string;
    guestName: string;
    checkInDate: string;
    checkOutDate: string;
  } | null;
}

export interface RoomData {
  id: string;
  name: string;
  isMixedGender: boolean;
  beds: BedData[];
}

export interface LocationData {
  name: string;
  rooms: RoomData[];
}

export function groupRooms(rows: RoomBedRow[]): LocationData[] {
  const locationsMap = new Map<string, Map<string, RoomData>>();

  for (const row of rows) {
    const locName = row.locationName || "Tanpa Lokasi";
    if (!locationsMap.has(locName)) {
      locationsMap.set(locName, new Map());
    }
    const roomsMap = locationsMap.get(locName)!;

    if (!roomsMap.has(row.roomId)) {
      roomsMap.set(row.roomId, {
        id: row.roomId,
        name: row.roomName,
        isMixedGender: row.isMixedGender,
        beds: [],
      });
    }

    const room = roomsMap.get(row.roomId)!;
    let bed = room.beds.find((b) => b.id === row.bedId);
    if (!bed) {
      bed = {
        id: row.bedId,
        number: row.bedNumber,
        status: row.bedStatus,
        reservation: null,
      };
      room.beds.push(bed);
    }

    if (row.reservationId) {
      const newRes = {
        id: row.reservationId,
        bookingCode: row.bookingCode!,
        status: row.reservationStatus!,
        guestId: row.guestId!,
        guestName: row.guestName!,
        checkInDate: row.checkInDate!,
        checkOutDate: row.checkOutDate!,
      };

      if (!bed.reservation || (newRes.status === "CHECKED_IN" && bed.reservation.status !== "CHECKED_IN")) {
        bed.reservation = newRes;
      }
    }
  }

  const result: LocationData[] = [];
  for (const [locName, roomsMap] of locationsMap.entries()) {
    result.push({
      name: locName,
      rooms: Array.from(roomsMap.values()),
    });
  }
  return result;
}

export function filterGroupedRooms(grouped: LocationData[], query: string): LocationData[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return grouped;

  return grouped
    .map((loc) => {
      const locMatches = loc.name.toLowerCase().includes(trimmed);

      const filteredRooms = loc.rooms.filter((room) => {
        if (locMatches) return true;
        if (room.name.toLowerCase().includes(trimmed)) return true;

        return room.beds.some((bed) =>
          bed.reservation?.guestName.toLowerCase().includes(trimmed)
        );
      });

      return {
        ...loc,
        rooms: filteredRooms,
      };
    })
    .filter((loc) => loc.rooms.length > 0);
}

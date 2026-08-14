import { describe, expect, it } from "vitest";
import type { RoomBedRow } from "./utils";
import { filterGroupedRooms, groupRooms } from "./utils";

const sampleRows: RoomBedRow[] = [
  {
    bedId: "b1",
    bedNumber: "Bed A",
    bedStatus: "CLEAN",
    roomId: "r1",
    roomName: "Kamar 101",
    locationName: "Lantai 1",
    isMixedGender: true,
    reservationId: "res1",
    bookingCode: "RES-00001",
    reservationStatus: "CHECKED_IN",
    guestId: "g1",
    guestName: "Alice Smith",
    checkInDate: "2026-08-13",
    checkOutDate: "2026-08-15",
  },
  {
    bedId: "b2",
    bedNumber: "Bed B",
    bedStatus: "DIRTY",
    roomId: "r1",
    roomName: "Kamar 101",
    locationName: "Lantai 1",
    isMixedGender: true,
    reservationId: null,
    bookingCode: null,
    reservationStatus: null,
    guestId: null,
    guestName: null,
    checkInDate: null,
    checkOutDate: null,
  },
  {
    bedId: "b3",
    bedNumber: "Bed A",
    bedStatus: "CLEAN",
    roomId: "r2",
    roomName: "Kamar 102",
    locationName: "Lantai 1",
    isMixedGender: false,
    reservationId: null,
    bookingCode: null,
    reservationStatus: null,
    guestId: null,
    guestName: null,
    checkInDate: null,
    checkOutDate: null,
  },
  {
    bedId: "b4",
    bedNumber: "Bed A",
    bedStatus: "CLEAN",
    roomId: "r3",
    roomName: "Kamar 201",
    locationName: "Lantai 2",
    isMixedGender: true,
    reservationId: "res2",
    bookingCode: "RES-00002",
    reservationStatus: "CONFIRMED",
    guestId: "g2",
    guestName: "Bob Jones",
    checkInDate: "2026-08-12",
    checkOutDate: "2026-08-14",
  },
];

describe("rooms utility functions", () => {
  it("groups flat database rows by location and room", () => {
    const grouped = groupRooms(sampleRows);

    expect(grouped).toHaveLength(2); // Lantai 1 and Lantai 2

    const lantai1 = grouped.find((g) => g.name === "Lantai 1");
    expect(lantai1).toBeDefined();
    expect(lantai1!.rooms).toHaveLength(2); // Kamar 101 and Kamar 102

    const room101 = lantai1!.rooms.find((r) => r.name === "Kamar 101");
    expect(room101).toBeDefined();
    expect(room101!.isMixedGender).toBe(true);
    expect(room101!.beds).toHaveLength(2);

    const bedA = room101!.beds.find((b) => b.number === "Bed A");
    expect(bedA).toBeDefined();
    expect(bedA!.status).toBe("CLEAN");
    expect(bedA!.reservation).toEqual({
      id: "res1",
      bookingCode: "RES-00001",
      status: "CHECKED_IN",
      guestId: "g1",
      guestName: "Alice Smith",
      checkInDate: "2026-08-13",
      checkOutDate: "2026-08-15",
    });

    const bedB = room101!.beds.find((b) => b.number === "Bed B");
    expect(bedB).toBeDefined();
    expect(bedB!.status).toBe("DIRTY");
    expect(bedB!.reservation).toBeNull();
  });

  it("filters rooms by guest name, room name, or location name", () => {
    const grouped = groupRooms(sampleRows);

    // Search by guest name
    const searchAlice = filterGroupedRooms(grouped, "alice");
    expect(searchAlice).toHaveLength(1);
    expect(searchAlice[0]!.name).toBe("Lantai 1");
    expect(searchAlice[0]!.rooms).toHaveLength(1);
    expect(searchAlice[0]!.rooms[0]!.name).toBe("Kamar 101");

    // Search by room name
    const search102 = filterGroupedRooms(grouped, "102");
    expect(search102).toHaveLength(1);
    expect(search102[0]!.rooms).toHaveLength(1);
    expect(search102[0]!.rooms[0]!.name).toBe("Kamar 102");

    // Search by location name
    const searchLantai2 = filterGroupedRooms(grouped, "lantai 2");
    expect(searchLantai2).toHaveLength(1);
    expect(searchLantai2[0]!.rooms).toHaveLength(1);
    expect(searchLantai2[0]!.rooms[0]!.name).toBe("Kamar 201");
  });

  it("deduplicates beds and prioritizes CHECKED_IN reservation status", () => {
    const overlappingRows: RoomBedRow[] = [
      {
        bedId: "b1",
        bedNumber: "Bed A",
        bedStatus: "CLEAN",
        roomId: "r1",
        roomName: "Kamar 101",
        locationName: "Lantai 1",
        isMixedGender: true,
        reservationId: "res_conf",
        bookingCode: "RES-CONF",
        reservationStatus: "CONFIRMED",
        guestId: "g1",
        guestName: "Alice Confirmed",
        checkInDate: "2026-08-13",
        checkOutDate: "2026-08-15",
      },
      {
        bedId: "b1",
        bedNumber: "Bed A",
        bedStatus: "CLEAN",
        roomId: "r1",
        roomName: "Kamar 101",
        locationName: "Lantai 1",
        isMixedGender: true,
        reservationId: "res_in",
        bookingCode: "RES-IN",
        reservationStatus: "CHECKED_IN",
        guestId: "g2",
        guestName: "Bob CheckedIn",
        checkInDate: "2026-08-13",
        checkOutDate: "2026-08-15",
      },
    ];

    const grouped = groupRooms(overlappingRows);
    expect(grouped).toHaveLength(1);
    expect(grouped[0]!.rooms).toHaveLength(1);
    
    const room = grouped[0]!.rooms[0]!;
    expect(room.beds).toHaveLength(1); // Bed is deduplicated
    expect(room.beds[0]!.reservation).toBeDefined();
    expect(room.beds[0]!.reservation!.id).toBe("res_in"); // Prioritized CHECKED_IN
  });
});

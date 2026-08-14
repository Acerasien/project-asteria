import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  pgEnum,
  pgSequence,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["ADMIN", "FRONT_DESK", "HOUSEKEEPING"]);
export const guestGender = pgEnum("guest_gender", ["MALE", "FEMALE"]);
export const roomStatus = pgEnum("room_status", ["CLEAN", "DIRTY", "MAINTENANCE", "OUT_OF_ORDER"]);
export const reservationStatus = pgEnum("reservation_status", [
  "CONFIRMED",
  "CHECKED_IN",
  "CHECKED_OUT",
  "CANCELLED",
]);

export const bookingNumberSequence = pgSequence("reservation_booking_number_seq", {
  startWith: 1,
  increment: 1,
  minValue: 1,
});

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: timestamp("email_verified", { withTimezone: true }),
    image: text("image"),
    passwordHash: text("password_hash").notNull(),
    role: userRole("role").notNull(),
    sessionVersion: integer("session_version").notNull().default(1),
    ...timestamps,
  },
  (table) => [uniqueIndex("users_email_unique_idx").on(sql`lower(${table.email})`)],
);

export const locations = pgTable(
  "locations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("locations_name_unique_idx").on(sql`lower(${table.name})`),
  ],
);

export const rooms = pgTable(
  "rooms",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    locationId: uuid("location_id").references(() => locations.id, { onDelete: "restrict" }),
    isMixedGender: boolean("is_mixed_gender").notNull().default(false),
    description: text("description"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("rooms_location_name_unique_idx").on(table.locationId, sql`lower(${table.name})`),
    index("rooms_location_idx").on(table.locationId),
  ],
);

export const beds = pgTable(
  "beds",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bedNumber: text("bed_number").notNull(),
    roomId: uuid("room_id")
      .notNull()
      .references(() => rooms.id, { onDelete: "restrict" }),
    status: roomStatus("status").notNull().default("CLEAN"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("beds_room_bed_number_unique_idx").on(table.roomId, sql`lower(${table.bedNumber})`),
    index("beds_status_idx").on(table.status),
    index("beds_room_idx").on(table.roomId),
  ],
);

export const guests = pgTable(
  "guests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fullName: text("full_name").notNull(),
    gender: guestGender("gender").notNull(),
    email: text("email"),
    phone: text("phone").notNull(),
    idNumber: text("id_number").notNull(),
    notes: text("notes"),
    ...timestamps,
  },
  (table) => [
    index("guests_name_idx").on(table.fullName),
    index("guests_phone_idx").on(table.phone),
    uniqueIndex("guests_id_number_unique_idx").on(sql`lower(${table.idNumber})`),
    uniqueIndex("guests_name_phone_unique_idx").on(sql`lower(${table.fullName})`, table.phone),
  ],
);

export const reservations = pgTable(
  "reservations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingCode: text("booking_code")
      .notNull()
      .unique()
      .default(sql`'RES-' || lpad(nextval('reservation_booking_number_seq')::text, 5, '0')`),
    guestId: uuid("guest_id")
      .notNull()
      .references(() => guests.id, { onDelete: "restrict" }),
    bedId: uuid("bed_id")
      .notNull()
      .references(() => beds.id, { onDelete: "restrict" }),
    checkInDate: date("check_in_date").notNull(),
    checkOutDate: date("check_out_date").notNull(),
    status: reservationStatus("status").notNull().default("CONFIRMED"),
    notes: text("notes"),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    ...timestamps,
  },
  (table) => [
    index("reservations_guest_idx").on(table.guestId),
    index("reservations_bed_idx").on(table.bedId),
    index("reservations_status_check_in_idx").on(table.status, table.checkInDate),
    index("reservations_status_check_out_idx").on(table.status, table.checkOutDate),
    index("reservations_created_at_idx").on(table.createdAt),
    check("reservations_dates_valid", sql`${table.checkOutDate} > ${table.checkInDate}`),
  ],
);

export const locationsRelations = relations(locations, ({ many }) => ({ rooms: many(rooms) }));
export const roomsRelations = relations(rooms, ({ one, many }) => ({
  location: one(locations, { fields: [rooms.locationId], references: [locations.id] }),
  beds: many(beds),
}));
export const bedsRelations = relations(beds, ({ one, many }) => ({
  room: one(rooms, { fields: [beds.roomId], references: [rooms.id] }),
  reservations: many(reservations),
}));
export const guestsRelations = relations(guests, ({ many }) => ({ reservations: many(reservations) }));
export const usersRelations = relations(users, ({ many }) => ({ createdReservations: many(reservations) }));
export const reservationsRelations = relations(reservations, ({ one }) => ({
  guest: one(guests, { fields: [reservations.guestId], references: [guests.id] }),
  bed: one(beds, { fields: [reservations.bedId], references: [beds.id] }),
  creator: one(users, { fields: [reservations.createdBy], references: [users.id] }),
}));

export type User = typeof users.$inferSelect;
export type Location = typeof locations.$inferSelect;
export type Room = typeof rooms.$inferSelect;
export type Bed = typeof beds.$inferSelect;
export type RoomStatus = (typeof roomStatus.enumValues)[number];
export type Guest = typeof guests.$inferSelect;
export type GuestGender = (typeof guestGender.enumValues)[number];
export type Reservation = typeof reservations.$inferSelect;
export type ReservationStatus = (typeof reservationStatus.enumValues)[number];

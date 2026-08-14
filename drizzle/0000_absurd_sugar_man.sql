CREATE TYPE "public"."guest_gender" AS ENUM('MALE', 'FEMALE');--> statement-breakpoint
CREATE TYPE "public"."reservation_status" AS ENUM('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."room_status" AS ENUM('CLEAN', 'DIRTY', 'MAINTENANCE', 'OUT_OF_ORDER');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'FRONT_DESK', 'HOUSEKEEPING');--> statement-breakpoint
CREATE SEQUENCE "public"."reservation_booking_number_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE TABLE "beds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bed_number" text NOT NULL,
	"room_id" uuid NOT NULL,
	"status" "room_status" DEFAULT 'CLEAN' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "beds_bed_number_unique" UNIQUE("bed_number")
);
--> statement-breakpoint
CREATE TABLE "guests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"gender" "guest_gender" NOT NULL,
	"email" text,
	"phone" text NOT NULL,
	"id_number" text NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_code" text DEFAULT 'RES-' || lpad(nextval('reservation_booking_number_seq')::text, 5, '0') NOT NULL,
	"guest_id" uuid NOT NULL,
	"bed_id" uuid NOT NULL,
	"check_in_date" date NOT NULL,
	"check_out_date" date NOT NULL,
	"status" "reservation_status" DEFAULT 'CONFIRMED' NOT NULL,
	"notes" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reservations_booking_code_unique" UNIQUE("booking_code"),
	CONSTRAINT "reservations_dates_valid" CHECK ("reservations"."check_out_date" > "reservations"."check_in_date")
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"location_id" uuid,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" timestamp with time zone,
	"image" text,
	"password_hash" text NOT NULL,
	"role" "user_role" NOT NULL,
	"session_version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "beds" ADD CONSTRAINT "beds_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_bed_id_beds_id_fk" FOREIGN KEY ("bed_id") REFERENCES "public"."beds"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "beds_status_idx" ON "beds" USING btree ("status");--> statement-breakpoint
CREATE INDEX "beds_room_idx" ON "beds" USING btree ("room_id");--> statement-breakpoint
CREATE INDEX "guests_name_idx" ON "guests" USING btree ("full_name");--> statement-breakpoint
CREATE INDEX "guests_phone_idx" ON "guests" USING btree ("phone");--> statement-breakpoint
CREATE UNIQUE INDEX "guests_id_number_unique_idx" ON "guests" USING btree (lower("id_number"));--> statement-breakpoint
CREATE UNIQUE INDEX "guests_name_phone_unique_idx" ON "guests" USING btree (lower("full_name"),"phone");--> statement-breakpoint
CREATE UNIQUE INDEX "locations_name_unique_idx" ON "locations" USING btree (lower("name"));--> statement-breakpoint
CREATE INDEX "reservations_guest_idx" ON "reservations" USING btree ("guest_id");--> statement-breakpoint
CREATE INDEX "reservations_bed_idx" ON "reservations" USING btree ("bed_id");--> statement-breakpoint
CREATE INDEX "reservations_status_check_in_idx" ON "reservations" USING btree ("status","check_in_date");--> statement-breakpoint
CREATE INDEX "reservations_status_check_out_idx" ON "reservations" USING btree ("status","check_out_date");--> statement-breakpoint
CREATE INDEX "reservations_created_at_idx" ON "reservations" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "rooms_name_unique_idx" ON "rooms" USING btree (lower("name"));--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique_idx" ON "users" USING btree (lower("email"));
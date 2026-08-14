ALTER TABLE "beds" DROP CONSTRAINT "beds_bed_number_unique";--> statement-breakpoint
DROP INDEX "rooms_name_unique_idx";--> statement-breakpoint
ALTER TABLE "beds" ADD COLUMN "is_temporary" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "beds" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "is_mixed_gender" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "beds_room_bed_number_unique_idx" ON "beds" USING btree ("room_id",lower("bed_number"));--> statement-breakpoint
CREATE UNIQUE INDEX "rooms_location_name_unique_idx" ON "rooms" USING btree ("location_id",lower("name"));--> statement-breakpoint
CREATE INDEX "rooms_location_idx" ON "rooms" USING btree ("location_id");
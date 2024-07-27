DROP TABLE "cities";--> statement-breakpoint
DROP TABLE "districts";--> statement-breakpoint
DROP TABLE "provinces";--> statement-breakpoint
ALTER TABLE "customer_addresses" DROP CONSTRAINT "customer_addresses_province_id_provinces_id_fk";
--> statement-breakpoint
ALTER TABLE "customer_addresses" DROP CONSTRAINT "customer_addresses_city_id_cities_id_fk";
--> statement-breakpoint
ALTER TABLE "customer_addresses" DROP CONSTRAINT "customer_addresses_district_id_districts_id_fk";
--> statement-breakpoint
ALTER TABLE "customer_addresses" ADD COLUMN "address" varchar(256);--> statement-breakpoint
ALTER TABLE "customer_addresses" DROP COLUMN IF EXISTS "province_id";--> statement-breakpoint
ALTER TABLE "customer_addresses" DROP COLUMN IF EXISTS "city_id";--> statement-breakpoint
ALTER TABLE "customer_addresses" DROP COLUMN IF EXISTS "district_id";
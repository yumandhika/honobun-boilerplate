DROP TABLE "cities" CASCADE;--> statement-breakpoint
DROP TABLE "districts" CASCADE;--> statement-breakpoint
DROP TABLE "provinces" CASCADE;--> statement-breakpoint
--> statement-breakpoint
ALTER TABLE "customer_addresses" ADD COLUMN "address" varchar(256);--> statement-breakpoint
ALTER TABLE "customer_addresses" DROP COLUMN IF EXISTS "province_id";--> statement-breakpoint
ALTER TABLE "customer_addresses" DROP COLUMN IF EXISTS "city_id";--> statement-breakpoint
ALTER TABLE "customer_addresses" DROP COLUMN IF EXISTS "district_id";
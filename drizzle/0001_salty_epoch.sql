CREATE TYPE "public"."product_status" AS ENUM('draft', 'live', 'archived');--> statement-breakpoint
ALTER TABLE "product" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "description" text NOT NULL;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "status" "product_status" DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "ai_generated" boolean DEFAULT true NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_primary_image_per_product" ON "product_image" USING btree ("product_id") WHERE is_primary = true;--> statement-breakpoint
ALTER TABLE "image" ADD CONSTRAINT "image_public_id_unique" UNIQUE("public_id");
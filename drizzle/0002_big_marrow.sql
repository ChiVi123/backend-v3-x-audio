ALTER TABLE "product_image" ADD COLUMN "is_primary" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "product_image" DROP COLUMN "isPrimary";
ALTER TABLE "category" DROP CONSTRAINT "category_parentId_category_id_fk";
--> statement-breakpoint
ALTER TABLE "product_image" DROP CONSTRAINT "product_image_productId_product_id_fk";
--> statement-breakpoint
ALTER TABLE "product_image" DROP CONSTRAINT "product_image_imageId_image_id_fk";
--> statement-breakpoint
ALTER TABLE "product" DROP CONSTRAINT "product_categoryId_category_id_fk";
--> statement-breakpoint
DROP INDEX "unique_primary_image_per_product";--> statement-breakpoint
ALTER TABLE "product_image" DROP CONSTRAINT "product_image_productId_imageId_pk";--> statement-breakpoint
ALTER TABLE "product_image" ADD CONSTRAINT "product_image_product_id_image_id_pk" PRIMARY KEY("product_id","image_id");--> statement-breakpoint
ALTER TABLE "category" ADD COLUMN "product_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "category" ADD COLUMN "parent_id" uuid;--> statement-breakpoint
ALTER TABLE "image" ADD COLUMN "remote_key" varchar(255);--> statement-breakpoint
ALTER TABLE "product_image" ADD COLUMN "product_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "product_image" ADD COLUMN "image_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "category_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "fr_graph_data" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "three_model_id" varchar(255);--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "ai_generated" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "category" ADD CONSTRAINT "category_parent_id_category_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_image" ADD CONSTRAINT "product_image_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_image" ADD CONSTRAINT "product_image_image_id_image_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."image"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_primary_image_per_product" ON "product_image" USING btree ("product_id") WHERE is_primary=true;--> statement-breakpoint
ALTER TABLE "category" DROP COLUMN "productCount";--> statement-breakpoint
ALTER TABLE "category" DROP COLUMN "parentId";--> statement-breakpoint
ALTER TABLE "image" DROP COLUMN "remoteKey";--> statement-breakpoint
ALTER TABLE "product_image" DROP COLUMN "productId";--> statement-breakpoint
ALTER TABLE "product_image" DROP COLUMN "imageId";--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN "categoryId";--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN "frGraphData";--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN "threeModelId";--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN "aiGenerated";
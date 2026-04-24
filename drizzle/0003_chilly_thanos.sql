ALTER TABLE "category" DROP CONSTRAINT "category_parent_id_category_id_fk";
--> statement-breakpoint
ALTER TABLE "product_image" DROP CONSTRAINT "product_image_product_id_product_id_fk";
--> statement-breakpoint
ALTER TABLE "product_image" DROP CONSTRAINT "product_image_image_id_image_id_fk";
--> statement-breakpoint
ALTER TABLE "category" ADD CONSTRAINT "category_parent_id_category_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."category"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_image" ADD CONSTRAINT "product_image_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_image" ADD CONSTRAINT "product_image_image_id_image_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."image"("id") ON DELETE cascade ON UPDATE no action;
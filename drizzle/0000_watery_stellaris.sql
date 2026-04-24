CREATE TYPE "public"."image_status" AS ENUM('pending', 'uploaded', 'error');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('draft', 'live', 'archived');--> statement-breakpoint
CREATE TABLE "category" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"productCount" integer DEFAULT 0 NOT NULL,
	"description" text,
	"parentId" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "category_name_unique" UNIQUE("name"),
	CONSTRAINT "category_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "image" (
	"id" uuid PRIMARY KEY NOT NULL,
	"url" varchar(255) NOT NULL,
	"alt" varchar(255) NOT NULL,
	"remoteKey" varchar(255),
	"provider" varchar(255),
	"metadata" jsonb,
	"status" "image_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "product_image" (
	"productId" uuid NOT NULL,
	"imageId" uuid NOT NULL,
	"isPrimary" boolean DEFAULT false NOT NULL,
	CONSTRAINT "product_image_productId_imageId_pk" PRIMARY KEY("productId","imageId")
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"categoryId" uuid NOT NULL,
	"description" text NOT NULL,
	"price" integer NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"specs" jsonb NOT NULL,
	"frGraphData" jsonb NOT NULL,
	"threeModelId" varchar(255),
	"status" "product_status" DEFAULT 'draft' NOT NULL,
	"aiGenerated" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "product_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "category" ADD CONSTRAINT "category_parentId_category_id_fk" FOREIGN KEY ("parentId") REFERENCES "public"."category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_image" ADD CONSTRAINT "product_image_productId_product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_image" ADD CONSTRAINT "product_image_imageId_image_id_fk" FOREIGN KEY ("imageId") REFERENCES "public"."image"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_categoryId_category_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_primary_image_per_product" ON "product_image" USING btree ("productId") WHERE is_primary=true;
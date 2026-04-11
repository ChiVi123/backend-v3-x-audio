import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray, sql } from 'drizzle-orm';
// biome-ignore lint/style/useImportType: NestJS requires importing the class itself, not just its type
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { ProductWithArrayImage, ProductWithSingleImage } from '~/core/entities/product.entity';
import type { ProductRepository, SaveProductInput, UpdateProductInput } from '~/core/repositories/product.repository';
import { type CategoryId, type ProductId, toImageId, toProductId } from '~/core/types/branded.type';
import { DRIZZLE_TOKEN } from '~/infrastructure/constants/provider-tokens';
import type { DrizzleDB } from '~/infrastructure/database/drizzle.provider';
import { imageTable, productImageTable, productTable } from '~/infrastructure/database/schemas';

@Injectable()
export class DrizzleProductRepository implements ProductRepository {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: NodePgDatabase<DrizzleDB>) {}

  async findById(id: ProductId): Promise<ProductWithArrayImage | null> {
    const rows = await this.db
      .select({
        product: productTable,
        image: imageTable,
        isPrimary: productImageTable.isPrimary,
      })
      .from(productTable)
      .leftJoin(productImageTable, eq(productTable.id, productImageTable.productId))
      .leftJoin(imageTable, eq(productImageTable.imageId, imageTable.id))
      .where(eq(productTable.id, id));

    console.log('[DrizzleProductRepository] findById', rows);

    if (rows.length === 0) return null;

    const firstRow = rows[0].product;
    const images = rows
      .filter((r) => r.image !== null)
      .map((r) => ({
        ...r.image!,
        isPrimary: r.isPrimary,
      }));

    return {
      ...firstRow,
      images,
    } as ProductWithArrayImage;
  }

  async findByCategory(categoryId: CategoryId): Promise<ProductWithSingleImage[]> {
    const rows = await this.db
      .select({
        product: productTable,
        image: imageTable,
        isPrimary: productImageTable.isPrimary,
      })
      .from(productTable)
      .leftJoin(
        productImageTable,
        and(eq(productTable.id, productImageTable.productId), eq(productImageTable.isPrimary, true)),
      )
      .leftJoin(imageTable, eq(productImageTable.imageId, imageTable.id))
      .where(eq(productTable.categoryId, categoryId));

    console.log('[DrizzleProductRepository] findByCategory', rows);

    return rows.map((r) => ({
      ...r.product,
      image: r.image ? { ...r.image, isPrimary: r.isPrimary } : null,
    })) as ProductWithSingleImage[];
  }

  async existsByName(name: string): Promise<boolean> {
    const query = sql`SELECT EXISTS (
      SELECT 1 FROM ${productTable} WHERE ${productTable.name} = ${name}
    )`;

    const result = await this.db.execute<{ exists: boolean }>(query);
    return result.rows[0].exists;
  }

  async save(product: SaveProductInput): Promise<ProductWithArrayImage> {
    const { images, ...productData } = product;
    const productId = productData.id || toProductId(crypto.randomUUID());

    return await this.db.transaction(async (tx) => {
      await tx
        .insert(productTable)
        .values({
          ...productData,
          id: productId,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: productTable.id,
          set: { ...productData, updatedAt: new Date() },
        });

      if (images && images.length > 0) {
        for (const img of images) {
          const imageId = toImageId(crypto.randomUUID());

          const [newImage] = await tx
            .insert(imageTable)
            .values({
              id: imageId,
              url: img.url!,
              publicId: img.publicId!,
              metadata: img.metadata,
              updatedAt: new Date(),
            })
            .returning();

          await tx.insert(productImageTable).values({
            productId: productId,
            imageId: newImage.id,
            isPrimary: img.isPrimary,
          });
        }
      }

      const result = await this.findById(productId);
      if (!result) throw new Error('Failed to retrieve product after saving');
      return result;
    });
  }

  async update(id: ProductId, input: UpdateProductInput): Promise<ProductWithArrayImage> {
    const { keepImages, newImages, deleteImageIds, ...productData } = input;

    return await this.db.transaction(async (tx) => {
      // Update basic product information
      if (Object.keys(productData).length > 0) {
        await tx
          .update(productTable)
          .set({ ...productData, updatedAt: new Date() })
          .where(eq(productTable.id, id));
      }

      // Handle image deletion (DELETE group)
      if (deleteImageIds && deleteImageIds.length > 0) {
        // Delete from the association table first
        await tx
          .delete(productImageTable)
          .where(and(eq(productImageTable.productId, id), inArray(productImageTable.imageId, deleteImageIds)));

        await tx.delete(imageTable).where(inArray(imageTable.id, deleteImageIds));
      }

      // Reset isPrimary to false for all images of the product
      await tx.update(productImageTable).set({ isPrimary: false }).where(eq(productImageTable.productId, id));

      // Update old images (KEEP group - mainly update isPrimary)
      if (keepImages && keepImages.length > 0) {
        for (const img of keepImages) {
          await tx
            .update(productImageTable)
            .set({ isPrimary: img.isPrimary })
            .where(and(eq(productImageTable.productId, id), eq(productImageTable.imageId, img.id)));
        }
      }

      // Add new images (ADD group)
      if (newImages && newImages.length > 0) {
        for (const img of newImages) {
          const newImageId = toImageId(crypto.randomUUID());

          await tx.insert(imageTable).values({
            id: newImageId,
            url: img.url,
            publicId: img.publicId,
            metadata: img.metadata, // Already processed by Use Case ?? 0
            updatedAt: new Date(),
          });

          await tx.insert(productImageTable).values({
            productId: id,
            imageId: newImageId,
            isPrimary: img.isPrimary,
          });
        }
      }

      const result = await this.findById(id);
      if (!result) throw new Error('Product not found after update');
      return result;
    });
  }

  async delete(id: ProductId): Promise<void> {
    await this.db.delete(productTable).where(eq(productTable.id, id));
  }
}

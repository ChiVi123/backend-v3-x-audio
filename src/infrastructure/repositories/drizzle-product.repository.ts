import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray, sql } from 'drizzle-orm';
// biome-ignore lint/style/useImportType: NestJS requires importing the class itself, not just its type
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { ProductWithArrayImage, ProductWithSingleImage } from '~/core/entities/product.entity';
import type { ProductRepository, SaveProductInput, UpdateProductInput } from '~/core/repositories/product.repository';
import { type CategoryId, type ImageId, type ProductId, toImageId } from '~/core/types/branded.type';
import { DRIZZLE_TOKEN } from '~/infrastructure/constants/provider-tokens';
import { isUniqueViolation } from '~/infrastructure/database/database.utils';
import type { DrizzleDB } from '~/infrastructure/database/drizzle.provider';
import { imageTable, productImageTable, productTable } from '~/infrastructure/database/schemas';
import type { DrizzleTX } from '~/infrastructure/types/drizzle.type';

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

  async save(input: SaveProductInput): Promise<ProductWithArrayImage> {
    const { images, ...productData } = input;

    try {
      return await this.db.transaction(async (tx) => {
        await tx.insert(productTable).values(productData);

        if (images && images.length > 0) {
          await this.handleInsertImages(tx, input.id, images);
        }

        const result = await this.findById(input.id);
        if (!result) throw new Error('Failed to retrieve product after save');
        return result;
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('Product with this name or slug already exists');
      }
      throw error;
    }
  }

  async update(id: ProductId, input: UpdateProductInput): Promise<ProductWithArrayImage> {
    const { keepImages, newImages, deleteImageIds, ...productFields } = input;

    try {
      return await this.db.transaction(async (tx) => {
        if (Object.keys(productFields).length > 0) {
          await tx.update(productTable).set(productFields).where(eq(productTable.id, id));
        }

        // Delete images
        if (deleteImageIds && deleteImageIds.length > 0) {
          await this.handleDeleteImages(tx, deleteImageIds);
        }

        // Update isPrimary for existing images
        if (keepImages && keepImages.length > 0) {
          await this.handleUpdateExistingImages(tx, id, keepImages);
        }

        // Add new images
        if (newImages && newImages.length > 0) {
          await this.handleInsertImages(tx, id, newImages);
        }

        const result = await this.findById(id);
        if (!result) throw new Error('Product not found after update');
        return result;
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('Product with this name or slug already exists');
      }
      throw error;
    }
  }

  async delete(id: ProductId): Promise<void> {
    await this.db.delete(productTable).where(eq(productTable.id, id));
  }

  // --- Private Helper Methods ---

  /**
   * Handle insert new images into imageTable and set up relationship in productImageTable
   */
  private async handleInsertImages(tx: DrizzleTX, productId: ProductId, images: SaveProductInput['images']) {
    for (const img of images) {
      const newImageId = toImageId(crypto.randomUUID());

      await tx.insert(imageTable).values({
        id: newImageId,
        url: img.url,
        publicId: img.publicId,
        metadata: img.metadata,
      });

      await tx.insert(productImageTable).values({
        productId,
        imageId: newImageId,
        isPrimary: img.isPrimary,
      });
    }
  }

  /**
   * Handle delete images from imageTable (productImageTable will be deleted automatically thanks to cascade)
   */
  private async handleDeleteImages(tx: DrizzleTX, imageIds: ImageId[]) {
    await tx.delete(imageTable).where(inArray(imageTable.id, imageIds));
  }

  /**
   * Update meta-data (like isPrimary) for existing image relationships
   */
  private async handleUpdateExistingImages(
    tx: DrizzleTX,
    productId: ProductId,
    keepImages: NonNullable<UpdateProductInput['keepImages']>,
  ) {
    for (const img of keepImages) {
      await tx
        .update(productImageTable)
        .set({ isPrimary: img.isPrimary })
        .where(and(eq(productImageTable.productId, productId), eq(productImageTable.imageId, img.id)));
    }
  }
}

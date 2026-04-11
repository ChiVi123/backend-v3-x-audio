import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray, sql } from 'drizzle-orm';
// biome-ignore lint/style/useImportType: NestJS requires importing the class itself, not just its type
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { ProductWithArrayImage, ProductWithSingleImage } from '~/core/entities/product.entity';
import type { ProductRepository, SaveProductInput, UpdateProductInput } from '~/core/repositories/product.repository';
import { type CategoryId, type ProductId, toImageId } from '~/core/types/branded.type';
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

  async save(input: SaveProductInput): Promise<ProductWithArrayImage> {
    return await this.db.transaction(async (tx) => {
      await tx.insert(productTable).values({
        id: input.id,
        name: input.name,
        slug: input.slug,
        categoryId: input.categoryId,
        description: input.description,
        price: input.price,
        stock: input.stock,
        specs: input.specs,
        frGraphData: input.frGraphData,
        threeModelId: input.threeModelId,
        status: input.status,
        aiGenerated: input.aiGenerated,
      });

      if (input.images && input.images.length > 0) {
        for (const img of input.images) {
          const newImageId = toImageId(crypto.randomUUID());
          await tx.insert(imageTable).values({
            id: newImageId,
            url: img.url,
            publicId: img.publicId,
            metadata: img.metadata,
          });
          await tx.insert(productImageTable).values({
            productId: input.id,
            imageId: newImageId,
            isPrimary: img.isPrimary,
          });
        }
      }

      const result = await this.findById(input.id);
      if (!result) throw new Error('Failed to create product');
      return result;
    });
  }

  async update(id: ProductId, input: UpdateProductInput): Promise<ProductWithArrayImage> {
    return await this.db.transaction(async (tx) => {
      const { keepImages, newImages, deleteImageIds, ...productFields } = input;

      if (Object.keys(productFields).length > 0) {
        await tx.update(productTable).set(productFields).where(eq(productTable.id, id));
      }

      if (deleteImageIds && deleteImageIds.length > 0) {
        await tx.delete(imageTable).where(inArray(imageTable.id, deleteImageIds));
      }

      if (keepImages) {
        for (const img of keepImages) {
          await tx
            .update(productImageTable)
            .set({ isPrimary: img.isPrimary })
            .where(and(eq(productImageTable.productId, id), eq(productImageTable.imageId, img.id)));
        }
      }

      if (newImages) {
        for (const img of newImages) {
          const newImageId = toImageId(crypto.randomUUID());
          await tx.insert(imageTable).values({
            id: newImageId,
            url: img.url,
            publicId: img.publicId,
            metadata: img.metadata,
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

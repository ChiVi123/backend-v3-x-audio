import { Inject } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
// biome-ignore lint/style/useImportType: NestJS requires importing the class itself, not just its type
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE_TOKEN } from '~/constants/provider-tokens';
import type { Product, ProductWithArrayImage, ProductWithSingleImage } from '~/core/domain/product.entity';
import type { ProductRepository } from '~/core/repositories/product.repository';
import type { CategoryId, ProductId } from '~/core/types/branded.type';
import type { DrizzleDB } from '~/infrastructure/database/drizzle.provider';
import { imageTable, productImageTable, productTable } from '~/infrastructure/database/schemas';

export class DrizzleProductRepository implements ProductRepository {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: NodePgDatabase<DrizzleDB>) {}

  // TODO: Log rows values
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

    if (rows.length === 0) return null;

    const firstRow = rows[0].product;
    const images = rows
      .filter((r) => r.image !== null)
      .map((r) => ({
        // biome-ignore lint/style/noNonNullAssertion: Đã filter null ở trên
        ...r.image!,
        isPrimary: r.isPrimary,
      }));

    return {
      ...firstRow,
      images,
    } as ProductWithArrayImage;
  }

  // TODO: Log rows values
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

    return rows.map((r) => ({
      ...r.product,
      image: r.image ? { ...r.image, isPrimary: r.isPrimary } : null,
    })) as ProductWithSingleImage[];
  }

  async save(product: Product): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx
        .insert(productTable)
        .values({
          id: product.id,
          name: product.name,
          slug: product.slug,
          categoryId: product.categoryId,
          price: product.price,
          stock: product.stock,
          specs: product.specs,
          frGraphData: product.frGraphData,
          threeModelId: product.threeModelId,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: productTable.id,
          set: { ...product, updatedAt: new Date() },
        });
    });
  }

  async delete(id: ProductId): Promise<void> {
    await this.db.delete(productTable).where(eq(productTable.id, id));
  }
}

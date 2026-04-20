import { Inject, Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { InternalServerErrorException } from '~/application/exceptions/internal-server-error.exception';
import type {
  CreateProductInput,
  ProductRepository,
  ProductWithCategoryAndMultipleImages,
  ProductWithCategoryAndSingleImage,
  UpdateProductInput,
} from '~/application/repositories/product.repository';
import type { ImageStatus } from '~/domain/enums/image.enum';
import type { ProductStatus } from '~/domain/enums/product.enum';
import { type ProductId, toCategoryId } from '~/domain/types/branded.type';
import { DRIZZLE_TOKEN } from '~/infrastructure/constants/drizzle';
import type { DrizzleSchema } from '~/infrastructure/database/drizzle';
import { productImageTable, productTable } from '~/infrastructure/database/drizzle/schema';

@Injectable()
export class DrizzleProductRepository implements ProductRepository {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: NodePgDatabase<DrizzleSchema>) {}

  async create(input: CreateProductInput): Promise<ProductWithCategoryAndMultipleImages> {
    const { images, ...product } = input;
    const result = await this.db.transaction(async (tx) => {
      const result = await tx.insert(productTable).values(product).returning();
      const createdProduct = await this.findById(result[0].id);
      if (!createdProduct) {
        throw new InternalServerErrorException('Failed to create product');
      }
      for (const image of images) {
        await tx
          .insert(productImageTable)
          .values({
            productId: createdProduct.id,
            imageId: image.id,
            isPrimary: image.isPrimary,
          })
          .onConflictDoUpdate({
            target: [productImageTable.productId, productImageTable.imageId],
            set: { isPrimary: image.isPrimary ?? false },
          });
      }
      return createdProduct;
    });

    return result;
  }

  async update(
    id: ProductId,
    { keepImages, newImages, removeImageIds, ...product }: UpdateProductInput,
  ): Promise<ProductWithCategoryAndMultipleImages> {
    return this.db.transaction(async (tx) => {
      if (Object.keys(product).length > 0) {
        await tx.update(productTable).set(product).where(eq(productTable.id, id));
      }

      if (keepImages && keepImages.length > 0) {
        for (const image of keepImages) {
          await tx
            .insert(productImageTable)
            .values({
              productId: id,
              imageId: image.id,
              isPrimary: image.isPrimary ?? false,
            })
            .onConflictDoUpdate({
              target: [productImageTable.productId, productImageTable.imageId],
              set: { isPrimary: image.isPrimary ?? false },
            });
        }
      }

      // Fetch the updated product (using tx to guarantee we read the uncommitted state if isolation level requires, though for PostGres with Drizzle, often we can just query inside tx)
      const updatedProduct = await tx.query.productTable.findFirst({
        where: (p) => eq(p.id, id),
        with: {
          category: true,
          productImages: {
            with: {
              image: true,
            },
          },
        },
      });

      if (!updatedProduct) {
        throw new InternalServerErrorException('Failed to retrieve updated product');
      }

      const { category, productImages, ...p } = updatedProduct;
      return {
        ...p,
        threeModelId: p.threeModelId ?? undefined,
        status: p.status as ProductStatus,
        updatedAt: p.updatedAt ?? undefined,
        category: {
          ...category,
          description: category.description ?? '',
          parentId: category.parentId ? toCategoryId(category.parentId) : undefined,
          updatedAt: category.updatedAt ?? undefined,
        },
        images: productImages.map(({ image, isPrimary }) => ({
          ...image,
          remoteKey: image.remoteKey ?? undefined,
          provider: image.provider ?? undefined,
          metadata: image.metadata ?? undefined,
          updatedAt: image.updatedAt ?? undefined,
          status: image.status as ImageStatus,
          isPrimary,
        })),
      };
    });
  }

  delete(id: ProductId): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async findById(id: ProductId): Promise<ProductWithCategoryAndMultipleImages | null> {
    const product = await this.db.query.productTable.findFirst({
      where: (p) => eq(p.id, id),
      with: {
        category: true,
        productImages: {
          with: {
            image: true,
          },
        },
      },
    });

    if (!product) {
      return null;
    }

    const { category, productImages, ...p } = product;
    return {
      ...p,
      threeModelId: p.threeModelId ?? undefined,
      status: p.status as ProductStatus,
      updatedAt: p.updatedAt ?? undefined,
      category: {
        ...category,
        description: category.description ?? '',
        parentId: category.parentId ? toCategoryId(category.parentId) : undefined,
        updatedAt: category.updatedAt ?? undefined,
      },
      images: productImages.map(({ image, isPrimary }) => ({
        ...image,
        remoteKey: image.remoteKey ?? undefined,
        provider: image.provider ?? undefined,
        metadata: image.metadata ?? undefined,
        updatedAt: image.updatedAt ?? undefined,
        status: image.status as ImageStatus,
        isPrimary,
      })),
    };
  }

  async findAll(): Promise<ProductWithCategoryAndSingleImage[]> {
    const products = await this.db.query.productTable.findMany({
      with: {
        category: true,
        productImages: {
          where: (pi) => eq(pi.isPrimary, true),
          limit: 1,
          with: {
            image: true,
          },
        },
      },
    });

    return products.map(({ category, productImages, ...p }) => {
      const { image, isPrimary } = productImages[0] ?? {};
      return {
        ...p,
        threeModelId: p.threeModelId ?? undefined,
        status: p.status as ProductStatus,
        updatedAt: p.updatedAt ?? undefined,
        category: {
          ...category,
          description: category.description ?? '',
          parentId: category.parentId ? toCategoryId(category.parentId) : undefined,
          updatedAt: category.updatedAt ?? undefined,
        },
        image: {
          ...image,
          remoteKey: image.remoteKey ?? undefined,
          provider: image.provider ?? undefined,
          metadata: image.metadata ?? undefined,
          updatedAt: image.updatedAt ?? undefined,
          status: image.status as ImageStatus,
          isPrimary,
        },
      };
    });
  }

  async existsByName(name: string): Promise<boolean> {
    const query = sql`SELECT EXISTS (
      SELECT 1 FROM ${productTable} WHERE ${productTable.name} = ${name}
    )`;

    const result = await this.db.execute<{ exists: boolean }>(query);
    return result.rows[0].exists;
  }

  async existsById(id: ProductId): Promise<boolean> {
    const query = sql`SELECT EXISTS (
      SELECT 1 FROM ${productTable} WHERE ${productTable.id} = ${id}
    )`;

    const result = await this.db.execute<{ exists: boolean }>(query);
    return result.rows[0].exists;
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { count, eq, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { BadRequestException } from '~/application/exceptions/bad-request.exception';
import { InternalServerErrorException } from '~/application/exceptions/internal-server-error.exception';
import { ProductMapper } from '~/application/mappers/product.mapper';
import type {
  CreateProductInput,
  ProductRepository,
  ProductWithCategoryAndMultipleImages,
  ProductWithCategoryAndSingleImage,
  UpdateProductInput,
} from '~/application/repositories/product.repository';
import type { PaginatedResult } from '~/application/types/pagination.type';
import type { ProductId } from '~/domain/types/branded.type';
import { DRIZZLE_TOKEN } from '~/infrastructure/constants/drizzle';
import type { DrizzleSchema } from '~/infrastructure/database/drizzle';
import { CATEGORY_COLUMNS, IMAGE_COLUMNS, PRODUCT_COLUMNS } from '~/infrastructure/database/drizzle/constants/columns';
import { productImageTable, productTable } from '~/infrastructure/database/drizzle/schema';

const ONE_PRIMARY_IMAGE = 1;

@Injectable()
export class DrizzleProductRepository implements ProductRepository {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: NodePgDatabase<DrizzleSchema>) {}

  async create(input: CreateProductInput): Promise<ProductWithCategoryAndMultipleImages> {
    const { images, ...product } = input;
    const result = await this.db.transaction(async (tx) => {
      const inserted = await tx.insert(productTable).values(product).returning();
      const productId = inserted[0].id;

      if (images.length > 0) {
        await tx
          .insert(productImageTable)
          .values(
            images.map((image) => ({
              productId: productId,
              imageId: image.id,
              isPrimary: image.isPrimary,
            })),
          )
          .onConflictDoUpdate({
            target: [productImageTable.productId, productImageTable.imageId],
            set: { isPrimary: sql`excluded.is_primary` },
          });
      }

      const createdProduct = await this.findById(productId, tx as any);
      if (!createdProduct) {
        throw new InternalServerErrorException('Failed to create product');
      }
      return createdProduct;
    });

    return result;
  }

  async update(
    id: ProductId,
    { keepImages, ...product }: UpdateProductInput,
  ): Promise<ProductWithCategoryAndMultipleImages> {
    return this.db.transaction(async (tx) => {
      if (Object.keys(product).length > 0) {
        await tx.update(productTable).set(product).where(eq(productTable.id, id));
      }

      if (keepImages && keepImages.length > 0) {
        const primaryCount = keepImages.filter((img) => img.isPrimary === true).length;

        if (primaryCount > ONE_PRIMARY_IMAGE) {
          throw new BadRequestException('Only one primary image is allowed');
        }

        if (primaryCount === ONE_PRIMARY_IMAGE) {
          await tx.update(productImageTable).set({ isPrimary: false }).where(eq(productImageTable.productId, id));
        }

        await tx
          .insert(productImageTable)
          .values(
            keepImages.map((image) => ({
              productId: id,
              imageId: image.id,
              isPrimary: image.isPrimary ?? false,
            })),
          )
          .onConflictDoUpdate({
            target: [productImageTable.productId, productImageTable.imageId],
            set: { isPrimary: sql`excluded.is_primary` },
          });
      }

      const updatedProduct = await tx.query.productTable.findFirst({
        where: (p) => eq(p.id, id),
        columns: PRODUCT_COLUMNS,
        with: {
          category: { columns: CATEGORY_COLUMNS },
          productImages: {
            with: {
              image: { columns: IMAGE_COLUMNS },
            },
          },
        },
      });

      if (!updatedProduct) {
        throw new InternalServerErrorException('Failed to retrieve updated product');
      }

      return ProductMapper.toResponseWithMultipleImages(updatedProduct);
    });
  }

  delete(id: ProductId): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async getRawById(id: ProductId): Promise<{ name: string } | null> {
    const product = await this.db.query.productTable.findFirst({
      where: (p) => eq(p.id, id),
      columns: {
        name: true,
      },
    });
    return product ?? null;
  }

  async findById(
    id: ProductId,
    db: NodePgDatabase<DrizzleSchema> = this.db,
  ): Promise<ProductWithCategoryAndMultipleImages | null> {
    const product = await db.query.productTable.findFirst({
      where: (p) => eq(p.id, id),
      columns: PRODUCT_COLUMNS,
      with: {
        category: { columns: CATEGORY_COLUMNS },
        productImages: {
          with: {
            image: { columns: IMAGE_COLUMNS },
          },
        },
      },
    });

    if (!product) {
      return null;
    }

    return ProductMapper.toResponseWithMultipleImages(product);
  }

  async findAll(page: number, limit: number): Promise<PaginatedResult<ProductWithCategoryAndSingleImage>> {
    const offset = (page - 1) * limit;

    const [totalResult] = await this.db.select({ value: count() }).from(productTable);
    const total = Number(totalResult.value);

    const products = await this.db.query.productTable.findMany({
      limit: limit,
      offset: offset,
      columns: PRODUCT_COLUMNS,
      with: {
        category: { columns: CATEGORY_COLUMNS },
        productImages: {
          where: (pi) => eq(pi.isPrimary, true),
          limit: 1,
          with: {
            image: { columns: IMAGE_COLUMNS },
          },
        },
      },
    });

    return {
      data: products.map(ProductMapper.toResponseWithSingleImage),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
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

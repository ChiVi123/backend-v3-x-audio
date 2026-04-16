import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type {
  CreateProductInput,
  ProductRepository,
  ProductWithCategoryAndMultipleImages,
  ProductWithCategoryAndSingleImage,
  UpdateProductInput,
} from '~/application/repositories/product.repository';
import type { ProductStatus } from '~/domain/enums/product.enum';
import { type ProductId, toCategoryId } from '~/domain/types/branded.type';
import { DRIZZLE_TOKEN } from '~/infrastructure/constants/drizzle';
import type { DrizzleSchema } from '~/infrastructure/database/drizzle';
import { categoryTable, productTable } from '~/infrastructure/database/drizzle/schema';

@Injectable()
export class DrizzleProductRepository implements ProductRepository {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: NodePgDatabase<DrizzleSchema>) {}

  create(product: CreateProductInput): Promise<ProductWithCategoryAndMultipleImages> {
    throw new Error('Method not implemented.');
  }

  update(id: ProductId, product: UpdateProductInput): Promise<ProductWithCategoryAndMultipleImages> {
    throw new Error('Method not implemented.');
  }

  delete(id: ProductId): Promise<void> {
    throw new Error('Method not implemented.');
  }

  findById(id: ProductId): Promise<ProductWithCategoryAndMultipleImages | null> {
    throw new Error('Method not implemented.');
  }

  async findAll(): Promise<ProductWithCategoryAndSingleImage[]> {
    const result = await this.db
      .select({
        product: productTable,
        category: categoryTable,
      })
      .from(productTable)
      .innerJoin(categoryTable, eq(productTable.categoryId, categoryTable.id));

    return result.map((r) => ({
      ...r.product,
      threeModelId: r.product.threeModelId ?? undefined,
      status: r.product.status as ProductStatus,
      updatedAt: r.product.updatedAt ?? undefined,
      category: {
        ...r.category,
        description: r.category.description ?? '',
        parentId: r.category.parentId ? toCategoryId(r.category.parentId) : undefined,
        updatedAt: r.category.updatedAt ?? undefined,
      },
      image: null,
    }));
  }

  existsByName(name: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}

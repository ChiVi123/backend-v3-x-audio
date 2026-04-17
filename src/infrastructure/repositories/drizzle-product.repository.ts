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
import type { ImageStatus } from '~/domain/enums/image.enum';
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

  existsByName(name: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}

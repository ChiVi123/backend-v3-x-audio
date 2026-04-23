import { CategoryMapper } from '~/application/mappers/category.mapper';
import { ImageMapper } from '~/application/mappers/image.mapper';
import type {
  ProductWithCategoryAndMultipleImages,
  ProductWithCategoryAndSingleImage,
} from '~/application/repositories/product.repository';
import type { ProductStatus } from '~/domain/enums/product.enum';
import { toProductId } from '~/domain/types/branded.type';

export const ProductMapper = {
  // biome-ignore lint/suspicious/noExplicitAny: Raw database results are often complex to type precisely without excessive boilerplate
  toResponseWithMultipleImages: (raw: any): ProductWithCategoryAndMultipleImages => {
    const { category, productImages, ...p } = raw;
    return {
      id: toProductId(p.id),
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      stock: p.stock,
      specs: p.specs,
      frGraphData: p.frGraphData,
      threeModelId: p.threeModelId ?? undefined,
      status: p.status as ProductStatus,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt ?? undefined,
      category: CategoryMapper.toDomain(category),
      // biome-ignore lint/suspicious/noExplicitAny: Raw database results are often complex to type precisely without excessive boilerplate
      images: (productImages ?? []).map(({ image, isPrimary }: any) => ({
        ...ImageMapper.toDomain(image),
        isPrimary,
      })),
    };
  },

  // biome-ignore lint/suspicious/noExplicitAny: Raw database results are often complex to type precisely without excessive boilerplate
  toResponseWithSingleImage: (raw: any): ProductWithCategoryAndSingleImage => {
    const { category, productImages, ...p } = raw;
    const pi = productImages?.[0];

    return {
      id: toProductId(p.id),
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      stock: p.stock,
      specs: p.specs,
      frGraphData: p.frGraphData,
      threeModelId: p.threeModelId ?? undefined,
      status: p.status as ProductStatus,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt ?? undefined,
      category: CategoryMapper.toDomain(category),
      image: pi ? { ...ImageMapper.toDomain(pi.image), isPrimary: pi.isPrimary } : null,
    };
  },
} as const;

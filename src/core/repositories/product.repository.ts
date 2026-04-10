import type { Image } from '~/core/entities/image.entity';
import type { Product, ProductWithArrayImage, ProductWithSingleImage } from '~/core/entities/product.entity';
import type { CategoryId, ProductId } from '~/core/types/branded.type';

export type SaveProductInput = Product & {
  images: Array<Pick<Image, 'url' | 'publicId'> & Partial<Image> & { isPrimary: boolean }>;
};

export abstract class ProductRepository {
  abstract findById(id: ProductId): Promise<ProductWithArrayImage | null>;
  abstract findByCategory(categoryId: CategoryId): Promise<ProductWithSingleImage[]>;
  abstract existsByName(name: string): Promise<boolean>;
  abstract save(product: SaveProductInput): Promise<ProductWithArrayImage>;
  abstract delete(id: ProductId): Promise<void>;
}

import type { Product, ProductWithArrayImage, ProductWithSingleImage } from '~/core/entities/product.entity';
import type { CategoryId, ProductId } from '~/core/types/branded.type';

export abstract class ProductRepository {
  abstract findById(id: ProductId): Promise<ProductWithArrayImage | null>;
  abstract findByCategory(categoryId: CategoryId): Promise<ProductWithSingleImage[]>;
  abstract save(product: Product): Promise<void>;
  abstract delete(id: ProductId): Promise<void>;
}

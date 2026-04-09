import type { Product, ProductWithArrayImage, ProductWithSingleImage } from '~/core/domain/product.entity';
import type { CategoryId, ProductId } from '~/core/types/branded.type';

export interface ProductRepository {
  findById(id: ProductId): Promise<ProductWithArrayImage | null>;
  findByCategory(categoryId: CategoryId): Promise<ProductWithSingleImage[]>;
  save(product: Product): Promise<void>;
  delete(id: ProductId): Promise<void>;
}

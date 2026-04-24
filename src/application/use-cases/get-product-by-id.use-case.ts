import type {
  ProductRepository,
  ProductWithCategoryAndMultipleImages,
} from '~/application/repositories/product.repository';
import type { ProductId } from '~/domain/types/branded.type';

export class GetProductByIdUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(id: ProductId): Promise<ProductWithCategoryAndMultipleImages | null> {
    return this.productRepository.findById(id);
  }
}

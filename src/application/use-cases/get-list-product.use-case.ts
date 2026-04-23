import type {
  ProductRepository,
  ProductWithCategoryAndSingleImage,
} from '~/application/repositories/product.repository';
import type { PaginatedResult } from '~/application/types/pagination.type';

export class GetListProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(page = 1, limit = 10): Promise<PaginatedResult<ProductWithCategoryAndSingleImage>> {
    return this.productRepository.findAll(page, limit);
  }
}

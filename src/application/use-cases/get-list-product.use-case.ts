import type {
  ProductRepository,
  ProductWithCategoryAndSingleImage,
} from '~/application/repositories/product.repository';

export class GetListProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(): Promise<ProductWithCategoryAndSingleImage[]> {
    return this.productRepository.findAll();
  }
}

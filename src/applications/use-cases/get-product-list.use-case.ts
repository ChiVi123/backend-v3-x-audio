import { Injectable } from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS requires importing the class itself, not just its type
import { ProductRepository } from '~/core/repositories/product.repository';
import { toCategoryId } from '~/core/types/branded.type';

@Injectable()
export class GetProductListUseCase {
  constructor(private readonly productRepo: ProductRepository) {}

  async execute(query: { categoryId?: string; limit?: number; page?: number }) {
    const limit = query.limit || 10;
    const offset = ((query.page || 1) - 1) * limit;

    const products = await this.productRepo.findAll({
      categoryId: query.categoryId ? toCategoryId(query.categoryId) : undefined,
      limit,
      offset,
    });

    return products;
  }
}

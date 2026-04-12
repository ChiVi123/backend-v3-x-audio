import { Injectable } from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS requires importing the class itself, not just its type
import { ProductRepository } from '~/core/repositories/product.repository';
import type { ProductId } from '~/core/types/branded.type';

@Injectable()
export class GetProductByIdUseCase {
  constructor(private readonly productRepo: ProductRepository) {}

  async execute(id: ProductId) {
    return this.productRepo.findById(id);
  }
}

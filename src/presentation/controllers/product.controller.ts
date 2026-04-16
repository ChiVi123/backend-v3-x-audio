import { Controller, Get } from '@nestjs/common';
import type { ProductWithCategoryAndSingleImage } from '~/application/repositories/product.repository';
import type { GetListProductUseCase } from '~/application/use-cases/get-list-product.use-case';

@Controller('products')
export class ProductController {
  constructor(private readonly getListProductUseCase: GetListProductUseCase) {}

  @Get()
  async findAll(): Promise<ProductWithCategoryAndSingleImage[]> {
    return this.getListProductUseCase.execute();
  }
}

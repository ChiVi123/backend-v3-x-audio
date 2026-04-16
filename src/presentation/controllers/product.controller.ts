import { Controller, Get } from '@nestjs/common';
import type { ProductWithCategoryAndSingleImage } from '~/application/repositories/product.repository';
// biome-ignore lint/style/useImportType: NestJS DI uses reflect-metadata to resolve this class as a runtime token; `import type` would erase it at compile time, breaking dependency injection
import { GetListProductUseCase } from '~/application/use-cases/get-list-product.use-case';

@Controller('products')
export class ProductController {
  constructor(private readonly getListProductUseCase: GetListProductUseCase) {}

  @Get()
  async findAll(): Promise<ProductWithCategoryAndSingleImage[]> {
    return this.getListProductUseCase.execute();
  }
}

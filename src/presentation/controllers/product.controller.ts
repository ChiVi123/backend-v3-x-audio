import { Controller, Get, Param } from '@nestjs/common';
import type {
  ProductWithCategoryAndMultipleImages,
  ProductWithCategoryAndSingleImage,
} from '~/application/repositories/product.repository';
// biome-ignore lint/style/useImportType: NestJS DI uses reflect-metadata to resolve this class as a runtime token; `import type` would erase it at compile time, breaking dependency injection
import { GetListProductUseCase } from '~/application/use-cases/get-list-product.use-case';
// biome-ignore lint/style/useImportType: NestJS DI uses reflect-metadata to resolve this class as a runtime token; `import type` would erase it at compile time, breaking dependency injection
import { GetProductByIdUseCase } from '~/application/use-cases/get-product-by-id.use-case';
import type { ProductId } from '~/domain/types/branded.type';

@Controller('products')
export class ProductController {
  constructor(
    private readonly getListProductUseCase: GetListProductUseCase,
    private readonly getProductByIdUseCase: GetProductByIdUseCase,
  ) {}

  @Get()
  async findAll(): Promise<ProductWithCategoryAndSingleImage[]> {
    return this.getListProductUseCase.execute();
  }

  @Get(':id')
  async findById(@Param('id') id: ProductId): Promise<ProductWithCategoryAndMultipleImages | null> {
    return this.getProductByIdUseCase.execute(id);
  }
}

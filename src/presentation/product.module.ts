import { Module } from '@nestjs/common';
import { CreateProductUseCase } from '~/applications/use-cases/create-product.use-case';
import { GetProductListUseCase } from '~/applications/use-cases/get-product-list.use-case';
import { UpdateProductUseCase } from '~/applications/use-cases/update-product.use-case';
import { ProductController } from './product.controller';

@Module({
  controllers: [ProductController],
  providers: [CreateProductUseCase, UpdateProductUseCase, GetProductListUseCase],
})
export class ProductModule {}

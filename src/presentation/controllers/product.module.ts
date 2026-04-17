import { Module } from '@nestjs/common';
import type { ProductRepository } from '~/application/repositories/product.repository';
import { GetListProductUseCase } from '~/application/use-cases/get-list-product.use-case';
import { GetProductByIdUseCase } from '~/application/use-cases/get-product-by-id.use-case';
import { PRODUCT_REPOSITORY_TOKEN } from '~/infrastructure/constants/repositories';
import { ProductController } from '~/presentation/controllers/product.controller';

@Module({
  controllers: [ProductController],
  providers: [
    {
      provide: GetListProductUseCase,
      useFactory: (productRepository: ProductRepository) => new GetListProductUseCase(productRepository),
      inject: [PRODUCT_REPOSITORY_TOKEN],
    },
    {
      provide: GetProductByIdUseCase,
      useFactory: (productRepository: ProductRepository) => new GetProductByIdUseCase(productRepository),
      inject: [PRODUCT_REPOSITORY_TOKEN],
    },
  ],
})
export class ProductModule {}

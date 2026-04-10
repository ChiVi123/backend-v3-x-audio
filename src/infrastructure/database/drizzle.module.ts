import { Global, Module } from '@nestjs/common';
import { CategoryRepository } from '~/core/repositories/category.repository';
import { ProductRepository } from '~/core/repositories/product.repository';
import { DRIZZLE_TOKEN } from '~/infrastructure/constants/provider-tokens';
import { DrizzleProvider } from '~/infrastructure/database/drizzle.provider';
import { DrizzleCategoryRepository } from '~/infrastructure/repositories/drizzle-category.repository';
import { DrizzleProductRepository } from '~/infrastructure/repositories/drizzle-product.repository';

@Global()
@Module({
  providers: [
    DrizzleProvider,
    { provide: ProductRepository, useClass: DrizzleProductRepository },
    { provide: CategoryRepository, useClass: DrizzleCategoryRepository },
  ],
  exports: [DRIZZLE_TOKEN, ProductRepository, CategoryRepository],
})
export class DatabaseModule {}

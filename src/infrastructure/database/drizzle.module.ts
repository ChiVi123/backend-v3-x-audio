import { Global, Module } from '@nestjs/common';
import { CategoryRepository } from '~/core/repositories/category.repository';
import { ImageRepository } from '~/core/repositories/image.repository';
import { ProductRepository } from '~/core/repositories/product.repository';
import { DRIZZLE_TOKEN } from '~/infrastructure/constants/provider-tokens';
import { DrizzleProvider } from '~/infrastructure/database/drizzle.provider';
import { DrizzleCategoryRepository } from '~/infrastructure/repositories/drizzle-category.repository';
import { DrizzleImageRepository } from '~/infrastructure/repositories/drizzle-image.repository';
import { DrizzleProductRepository } from '~/infrastructure/repositories/drizzle-product.repository';

@Global()
@Module({
  providers: [
    DrizzleProvider,
    { provide: ProductRepository, useClass: DrizzleProductRepository },
    { provide: CategoryRepository, useClass: DrizzleCategoryRepository },
    { provide: ImageRepository, useClass: DrizzleImageRepository },
  ],
  exports: [DRIZZLE_TOKEN, ProductRepository, CategoryRepository],
})
export class DatabaseModule {}

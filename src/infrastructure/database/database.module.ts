import { Global, Module } from '@nestjs/common';
import { PRODUCT_REPOSITORY_TOKEN } from '~/infrastructure/constants/repositories';
import { DrizzleProvider } from '~/infrastructure/database/drizzle';
import { DrizzleProductRepository } from '~/infrastructure/repositories/drizzle-product.repository';

@Global()
@Module({
  providers: [DrizzleProvider, { provide: PRODUCT_REPOSITORY_TOKEN, useClass: DrizzleProductRepository }],
  exports: [DrizzleProvider, PRODUCT_REPOSITORY_TOKEN],
})
export class DatabaseModule {}

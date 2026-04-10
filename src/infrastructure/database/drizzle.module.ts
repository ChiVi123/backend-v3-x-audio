import { Global, Module } from '@nestjs/common';
import { ProductRepository } from '~/core/repositories/product.repository';
import { DRIZZLE_TOKEN } from '~/infrastructure/constants/provider-tokens';
import { DrizzleProvider } from '~/infrastructure/database/drizzle.provider';
import { DrizzleProductRepository } from '~/infrastructure/repositories/drizzle-product.repository';

@Global()
@Module({
  providers: [DrizzleProvider, { provide: ProductRepository, useClass: DrizzleProductRepository }],
  exports: [DRIZZLE_TOKEN, ProductRepository],
})
export class DatabaseModule {}

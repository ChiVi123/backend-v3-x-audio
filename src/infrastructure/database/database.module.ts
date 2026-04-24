import { Global, Module } from '@nestjs/common';
import { IMAGE_REPOSITORY_TOKEN, PRODUCT_REPOSITORY_TOKEN, USER_REPOSITORY_TOKEN } from '~/infrastructure/constants/provider-token';
import { DrizzleProvider } from '~/infrastructure/database/drizzle';
import { DrizzleImageRepository } from '~/infrastructure/repositories/drizzle-image.repository';
import { DrizzleProductRepository } from '~/infrastructure/repositories/drizzle-product.repository';
import { DrizzleUserRepository } from '~/infrastructure/repositories/drizzle-user.repository';

@Global()
@Module({
  providers: [
    DrizzleProvider,
    { provide: PRODUCT_REPOSITORY_TOKEN, useClass: DrizzleProductRepository },
    { provide: IMAGE_REPOSITORY_TOKEN, useClass: DrizzleImageRepository },
    { provide: USER_REPOSITORY_TOKEN, useClass: DrizzleUserRepository },
  ],
  exports: [DrizzleProvider, PRODUCT_REPOSITORY_TOKEN, IMAGE_REPOSITORY_TOKEN, USER_REPOSITORY_TOKEN],
})
export class DatabaseModule {}

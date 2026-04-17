import { Module } from '@nestjs/common';
import type { ImageRepository } from '~/application/repositories/image.repository';
import type { ProductRepository } from '~/application/repositories/product.repository';
import type { MediaService } from '~/application/services/media.service';
import type { ImageResponse } from '~/application/types/media.type';
import { CreateProductUseCase } from '~/application/use-cases/create-product.use-case';
import { GetListProductUseCase } from '~/application/use-cases/get-list-product.use-case';
import { GetProductByIdUseCase } from '~/application/use-cases/get-product-by-id.use-case';
import { CloudinaryModule } from '~/infrastructure/cloudinary/cloudinary.module';
import {
  IMAGE_REPOSITORY_TOKEN,
  MEDIA_SERVICE_TOKEN,
  PRODUCT_REPOSITORY_TOKEN,
} from '~/infrastructure/constants/provider-token';
import { ProductController } from '~/presentation/controllers/product.controller';

@Module({
  imports: [CloudinaryModule],
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
    {
      provide: CreateProductUseCase,
      useFactory: (
        productRepository: ProductRepository,
        imageRepository: ImageRepository,
        mediaService: MediaService<ImageResponse>,
      ) => new CreateProductUseCase(productRepository, imageRepository, mediaService),
      inject: [PRODUCT_REPOSITORY_TOKEN, IMAGE_REPOSITORY_TOKEN, MEDIA_SERVICE_TOKEN],
    },
  ],
})
export class ProductModule {}

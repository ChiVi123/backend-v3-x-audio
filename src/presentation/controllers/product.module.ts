import { Module } from '@nestjs/common';
import type { ImageRepository } from '~/application/repositories/image.repository';
import type { ProductRepository } from '~/application/repositories/product.repository';
import type { MediaService } from '~/application/services/media.service';
import type { SlugifyService } from '~/application/services/slugify.service';
import type { ImageResponse } from '~/application/types/media.type';
import { CreateProductUseCase } from '~/application/use-cases/create-product.use-case';
import { GetListProductUseCase } from '~/application/use-cases/get-list-product.use-case';
import { GetProductByIdUseCase } from '~/application/use-cases/get-product-by-id.use-case';
import { UpdateProductUseCase } from '~/application/use-cases/update-product.use-case';
import { CloudinaryModule } from '~/infrastructure/cloudinary/cloudinary.module';
import {
  IMAGE_REPOSITORY_TOKEN,
  LOGGER_SERVICE_TOKEN,
  MEDIA_SERVICE_TOKEN,
  PRODUCT_REPOSITORY_TOKEN,
  SLUGIFY_SERVICE_TOKEN,
} from '~/infrastructure/constants/provider-token';
import type { LoggerFactory } from '~/infrastructure/services/service.module';
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
        slugifyService: SlugifyService,
        loggerFactory: LoggerFactory,
      ) => {
        const logger = loggerFactory.create(CreateProductUseCase.name);
        return new CreateProductUseCase(productRepository, imageRepository, mediaService, slugifyService, logger);
      },
      inject: [
        PRODUCT_REPOSITORY_TOKEN,
        IMAGE_REPOSITORY_TOKEN,
        MEDIA_SERVICE_TOKEN,
        SLUGIFY_SERVICE_TOKEN,
        LOGGER_SERVICE_TOKEN,
      ],
    },
    {
      provide: UpdateProductUseCase,
      useFactory: (
        productRepository: ProductRepository,
        imageRepository: ImageRepository,
        mediaService: MediaService<ImageResponse>,
        slugifyService: SlugifyService,
        loggerFactory: LoggerFactory,
      ) => {
        const logger = loggerFactory.create(UpdateProductUseCase.name);
        return new UpdateProductUseCase(productRepository, imageRepository, mediaService, slugifyService, logger);
      },
      inject: [
        PRODUCT_REPOSITORY_TOKEN,
        IMAGE_REPOSITORY_TOKEN,
        MEDIA_SERVICE_TOKEN,
        SLUGIFY_SERVICE_TOKEN,
        LOGGER_SERVICE_TOKEN,
      ],
    },
  ],
})
export class ProductModule {}

import { Logger } from '@nestjs/common';
import slugify from 'slugify';
import { PENDING_IMAGE_DEFAULT } from '~/application/constants/default-value';
import { ConflictException } from '~/application/exceptions/conflict.exception';
import type { ImageRepository } from '~/application/repositories/image.repository';
import type {
  CreateProductInput,
  ProductRepository,
  ProductWithCategoryAndMultipleImages,
} from '~/application/repositories/product.repository';
import type { MediaService } from '~/application/services/media.service';
import type { FileUpload, ImageResponse } from '~/application/types/media.type';
import { ImageStatus } from '~/domain/enums/image.enum';
import { ProductStatus } from '~/domain/enums/product.enum';

export class CreateProductUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly imageRepository: ImageRepository,
    private readonly mediaService: MediaService<ImageResponse>,
  ) {}

  async execute(
    input: Omit<CreateProductInput, 'slug'>,
    file: FileUpload,
  ): Promise<ProductWithCategoryAndMultipleImages> {
    const exists = await this.productRepository.existsByName(input.name);
    if (exists) {
      throw new ConflictException('Product', 'name', input.name);
    }

    const slug = slugify(input.name, { lower: true });

    let product = await this.productRepository.create({ ...input, slug, status: ProductStatus.DRAFT });
    const image = await this.imageRepository.create({
      ...PENDING_IMAGE_DEFAULT,
      status: ImageStatus.PENDING,
    });

    try {
      const uploadedFile = await this.mediaService.upload(file);
      product = await this.productRepository.update(product.id, {
        status: (input.status as ProductStatus) ?? ProductStatus.DRAFT,
        keepImages: [{ id: image.id, isPrimary: true }],
      });
      await this.imageRepository.update(image.id, {
        ...uploadedFile,
        status: ImageStatus.UPLOADED,
      });
    } catch (error) {
      Logger.error(error, 'CreateProductUseCase.execute');
    }

    return product;
  }
}

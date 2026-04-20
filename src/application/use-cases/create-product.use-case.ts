import slugify from 'slugify';
import { PENDING_IMAGE_DEFAULT } from '~/application/constants/default-value';
import { BadRequestException } from '~/application/exceptions/bad-request.exception';
import { ConflictException } from '~/application/exceptions/conflict.exception';
import type { ImageRepository, UpdateManyImageInput } from '~/application/repositories/image.repository';
import type {
  CreateProductInput,
  ProductRepository,
  ProductWithCategoryAndMultipleImages,
} from '~/application/repositories/product.repository';
import type { MediaService } from '~/application/services/media.service';
import type { FileUpload, ImageResponse } from '~/application/types/media.type';
import type { ImageEntity } from '~/domain/entities/image.entity';
import { ImageStatus } from '~/domain/enums/image.enum';
import { ProductStatus } from '~/domain/enums/product.enum';

export interface CreateProductUseCaseInput extends Omit<CreateProductInput, 'slug' | 'images'> {
  images: Partial<Pick<ImageEntity, 'alt' | 'isPrimary'>>[];
}

export class CreateProductUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly imageRepository: ImageRepository,
    private readonly mediaService: MediaService<ImageResponse>,
  ) {}

  async execute(input: CreateProductUseCaseInput, files: FileUpload[]): Promise<ProductWithCategoryAndMultipleImages> {
    const exists = await this.productRepository.existsByName(input.name);
    if (exists) {
      throw new ConflictException('Product', 'name', input.name);
    }

    const { images: imageMetadataList, ...productData } = input;
    if (imageMetadataList.length !== files.length) {
      throw new BadRequestException('Images metadata and files must have the same length');
    }

    const slug = slugify(input.name, { lower: true, strict: true, trim: true });

    // 1. Create PENDING image records
    const pendingImages = await this.imageRepository.createMany(
      imageMetadataList.map((meta, index) => ({
        ...PENDING_IMAGE_DEFAULT,
        alt: meta.alt ?? `${productData.name} ${index + 1}`,
      })),
    );

    // 2. Create Product
    let product = await this.productRepository.create({
      ...productData,
      slug,
      images: pendingImages.map((img, index) => ({
        id: img.id,
        isPrimary: imageMetadataList[index].isPrimary ?? false,
      })),
      status: productData.status ?? ProductStatus.DRAFT,
    });

    try {
      // 3. [XXX]
      const imageSettledResults = await this.mediaService.uploadMultiple(files);

      // 4. [XXX]
      const imageUpdateData: UpdateManyImageInput[] = imageSettledResults.map((res, index) => ({
        id: pendingImages[index].id,
        ...(res.status === 'fulfilled' ? res.value : {}),
        status: res.status === 'fulfilled' ? ImageStatus.UPLOADED : ImageStatus.ERROR,
      }));

      const imageErrors = imageUpdateData.filter((result) => result.status === ImageStatus.ERROR);
      const imageSuccess = imageUpdateData.filter((result) => result.status === ImageStatus.UPLOADED);

      if (imageErrors.length > 0) {
        // Logger.error(`Failed to upload ${error.length} images: ${error.join(', ')}`, 'CreateProductUseCase');
        await this.imageRepository.deleteMany(imageErrors.map((image) => image.id));
      }

      await this.imageRepository.updateMany(imageSuccess);
    } catch (_error) {
      // Should log error
      // Delete all pending image are error
      await this.imageRepository.deleteMany(pendingImages.map((image) => image.id));
      product = await this.productRepository.update(product.id, {
        status: ProductStatus.DRAFT,
      });
    }

    return product;
  }
}

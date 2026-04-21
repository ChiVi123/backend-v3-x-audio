import { PENDING_IMAGE_DEFAULT } from '~/application/constants/default-value';
import { BadRequestException } from '~/application/exceptions/bad-request.exception';
import { ConflictException } from '~/application/exceptions/conflict.exception';
import { InternalServerErrorException } from '~/application/exceptions/internal-server-error.exception';
import type { ImageRepository, UpdateManyImageInput } from '~/application/repositories/image.repository';
import type {
  CreateProductInput,
  ProductRepository,
  ProductWithCategoryAndMultipleImages,
} from '~/application/repositories/product.repository';
import type { LoggerService } from '~/application/services/logger.service';
import type { MediaService } from '~/application/services/media.service';
import type { SlugifyService } from '~/application/services/slugify.service';
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
    private readonly slugifyService: SlugifyService,
    private readonly logger: LoggerService,
  ) {}

  async execute(input: CreateProductUseCaseInput, files: FileUpload[]): Promise<ProductWithCategoryAndMultipleImages> {
    const exists = await this.productRepository.existsByName(input.name);
    if (exists) {
      throw new ConflictException('Product', 'name', input.name);
    }

    const { images: imagesMetadata, ...productData } = input;
    if (imagesMetadata.length !== files.length) {
      throw new BadRequestException('Images metadata and files must have the same length');
    }

    const slug = this.slugifyService.slugify(input.name);

    // 1. Create PENDING image records
    const pendingImages = await this.imageRepository.createMany(
      imagesMetadata.map((meta) => ({
        ...PENDING_IMAGE_DEFAULT,
        alt: meta.alt ?? productData.name,
      })),
    );

    let product: ProductWithCategoryAndMultipleImages | null = null;

    try {
      // 2. Create Product
      product = await this.productRepository.create({
        ...productData,
        slug,
        images: pendingImages.map((img, index) => ({
          id: img.id,
          isPrimary: imagesMetadata[index].isPrimary ?? false,
        })),
        status: productData.status ?? ProductStatus.DRAFT,
      });

      // 3. Upload images to Cloudinary
      const imageSettledResults = await this.mediaService.uploadMultiple(files);

      // 4. Update image records
      const imageUpdateData: UpdateManyImageInput[] = imageSettledResults.map((res, index) => ({
        id: pendingImages[index].id,
        ...(res.status === 'fulfilled' ? res.value : {}),
        alt: imagesMetadata[index].alt ?? `${productData.name} ${index + 1}`,
        status: res.status === 'fulfilled' ? ImageStatus.UPLOADED : ImageStatus.ERROR,
      }));

      const imageErrors = imageUpdateData.filter((result) => result.status === ImageStatus.ERROR);
      const imageSuccess = imageUpdateData.filter((result) => result.status === ImageStatus.UPLOADED);

      if (imageErrors.length > 0) {
        this.logger.error(`Failed to upload ${imageErrors.length} images: ${imageErrors.join(', ')}`);
        await this.imageRepository.deleteMany(imageErrors.map((image) => image.id));
      }

      await this.imageRepository.updateMany(imageSuccess);

      // 5. Re-fetch product to get updated image status and URLs
      const updatedProduct = await this.productRepository.findById(product.id);
      if (!updatedProduct) {
        throw new InternalServerErrorException('Failed to retrieve updated product after image upload');
      }
      return updatedProduct;
    } catch (error) {
      this.logger.error(error);
      // Delete all pending image are error
      await this.imageRepository.deleteMany(pendingImages.map((image) => image.id));

      if (product?.id) {
        return this.productRepository.update(product.id, {
          status: ProductStatus.DRAFT,
        });
      } else {
        throw error;
      }
    }
  }
}

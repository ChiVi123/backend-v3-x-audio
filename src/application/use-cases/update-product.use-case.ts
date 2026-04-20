import { PENDING_IMAGE_DEFAULT } from '~/application/constants/default-value';
import { BadRequestException } from '~/application/exceptions/bad-request.exception';
import { NotFoundException } from '~/application/exceptions/not-found.exception';
import type { ImageRepository, UpdateManyImageInput } from '~/application/repositories/image.repository';
import type { ProductRepository, UpdateProductInput } from '~/application/repositories/product.repository';
import type { LoggerService } from '~/application/services/logger.service';
import type { MediaService } from '~/application/services/media.service';
import type { SlugifyService } from '~/application/services/slugify.service';
import type { FileUpload, ImageResponse } from '~/application/types/media.type';
import type { ImageEntity } from '~/domain/entities/image.entity';
import { ImageStatus } from '~/domain/enums/image.enum';
import type { ProductId } from '~/domain/types/branded.type';

export class UpdateProductUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly imageRepository: ImageRepository,
    private readonly mediaService: MediaService<ImageResponse>,
    private readonly slugifyService: SlugifyService,
    private readonly logger: LoggerService,
  ) {}

  async execute(id: ProductId, input: UpdateProductInput, files: FileUpload[]) {
    const { newImages: newImagesMetadata, removeImageIds, keepImages = [], ...productData } = input;

    const exists = await this.productRepository.existsById(id);
    if (!exists) {
      throw new NotFoundException('Product', 'id', id);
    }

    if (newImagesMetadata?.length !== files.length) {
      throw new BadRequestException('New images metadata and files must have the same length');
    }

    // 1. Create PENDING image records for new files
    let newlyCreatedImages: ImageEntity[] = [];
    if (newImagesMetadata && newImagesMetadata.length > 0) {
      newlyCreatedImages = await this.imageRepository.createMany(
        newImagesMetadata.map((meta, index) => ({
          ...PENDING_IMAGE_DEFAULT,
          alt: (meta.alt ?? productData.name) ? `${productData.name} ${index + 1}` : `Product image ${index + 1}`,
        })),
      );
    }

    // 2. Prepare the final set of images to be linked to the product
    const allKeepImages = [
      ...keepImages,
      ...newlyCreatedImages.map((img, index) => ({
        id: img.id,
        isPrimary: newImagesMetadata![index].isPrimary ?? false,
      })),
    ];

    const updateData: UpdateProductInput = {
      ...productData,
      keepImages: allKeepImages,
    };

    if (productData.name) {
      updateData.slug = this.slugifyService.slugify(productData.name);
    }

    // 3. Update Product and its image links in a single transaction
    const updatedProduct = await this.productRepository.update(id, updateData);

    // 4. Upload new files
    if (files.length > 0) {
      try {
        const imageSettledResults = await this.mediaService.uploadMultiple(files);
        // 5. Finalize new image records with upload results
        // Mapping back to newlyCreatedImages using index (preserved by uploadMultiple)
        const imageUpdateData: UpdateManyImageInput[] = imageSettledResults.map((res, index) => ({
          id: newlyCreatedImages[index].id,
          ...(res.status === 'fulfilled' ? res.value : {}),
          status: res.status === 'fulfilled' ? ImageStatus.UPLOADED : ImageStatus.ERROR,
        }));

        const imageErrors = imageUpdateData.filter((result) => result.status === ImageStatus.ERROR);
        const imageSuccess = imageUpdateData.filter((result) => result.status === ImageStatus.UPLOADED);

        if (imageErrors.length > 0) {
          this.logger.error(`Failed to upload ${imageErrors.length} images: ${imageErrors.join(', ')}`);
          // Delete all pending image are error
          await this.imageRepository.deleteMany(imageErrors.map((image) => image.id));
        }

        if (imageSuccess.length > 0) {
          await this.imageRepository.updateMany(imageSuccess);
        }
      } catch (error) {
        this.logger.error(error);
        // Delete all pending image are error
        await this.imageRepository.deleteMany(newlyCreatedImages.map((image) => image.id));
      }
    }

    // 6. Cleanup removed images (DB + Storage)
    if (removeImageIds && removeImageIds.length > 0) {
      const imagesToDelete = await this.imageRepository.findByIds(removeImageIds);
      const remoteKeys = imagesToDelete.map((img) => img.remoteKey).filter((key): key is string => !!key);

      if (remoteKeys.length > 0) {
        try {
          await this.mediaService.deleteMultiple(remoteKeys);
        } catch (error) {
          this.logger.error(error);
        }
      }

      await this.imageRepository.deleteMany(removeImageIds);
    }

    return updatedProduct;
  }
}

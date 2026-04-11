import { Injectable, NotFoundException } from '@nestjs/common';
import type { UpdateProductDto } from '~/applications/dtos/update-product.dto';
// biome-ignore lint/style/useImportType: NestJS injects dependencies
import { CategoryRepository } from '~/core/repositories/category.repository';
// biome-ignore lint/style/useImportType: NestJS injects dependencies
import { ProductRepository } from '~/core/repositories/product.repository';
// biome-ignore lint/style/useImportType: NestJS injects dependencies
import { MediaService, UploadMediaResponse } from '~/core/services/media.service';
import {
  type ImageId,
  type ProductId,
  toCategoryId,
  toDecibel,
  toHertz,
  toOhm,
  toUsd,
} from '~/core/types/branded.type';

@Injectable()
export class UpdateProductUseCase {
  constructor(
    private readonly productRepo: ProductRepository,
    private readonly mediaService: MediaService,
    private readonly categoryRepo: CategoryRepository,
  ) {}

  async execute(productId: ProductId, dto: UpdateProductDto) {
    const currentProduct = await this.productRepo.findById(productId);
    if (!currentProduct) throw new NotFoundException('Product not found');

    if (dto.categoryId) {
      const categoryExists = await this.categoryRepo.existsById(toCategoryId(dto.categoryId));
      if (!categoryExists) throw new NotFoundException('Category not found');
    }

    /**
     * Separate all fields that need mapping (Branded Types) from updateFields
     * to avoid leaking 'string' or 'number' types into the repository.
     */
    const { images, categoryId, price, specs, frGraphData, ...updateFields } = dto;

    let keepImages: { id: ImageId; isPrimary: boolean }[] = [];
    let deleteImageIds: ImageId[] = [];
    let newUploadedImages: (UploadMediaResponse & { isPrimary: boolean })[] = [];

    if (images) {
      const imagesToKeep = images.filter((img) => img.id);
      const imagesToUpload = images.filter((img) => img.file);

      const imageIdsToKeep = new Set(imagesToKeep.map((img) => img.id as ImageId));
      const imagesToDelete = currentProduct.images.filter((img) => !imageIdsToKeep.has(img.id));

      deleteImageIds = imagesToDelete.map((img) => img.id);
      keepImages = imagesToKeep.map((img) => ({
        id: img.id as ImageId,
        isPrimary: img.isPrimary,
      }));

      newUploadedImages = await Promise.all(
        imagesToUpload.map((img) =>
          this.mediaService.upload(img.file!, 'products').then((res) => ({
            ...res,
            isPrimary: img.isPrimary,
          })),
        ),
      );
    }

    try {
      // Prepare update data with correct data types
      const updateInput = {
        ...updateFields, // Only contains name, description, stock, threeModelId (plain type)
        ...(price !== undefined && { price: toUsd(price) }),
        ...(categoryId !== undefined && { categoryId: toCategoryId(categoryId) }),
        ...(specs && {
          specs: {
            impedance: toOhm(specs.impedance),
            sensitivity: toDecibel(specs.sensitivity),
            frequencyResponse: {
              min: toHertz(specs.frequencyResponse.min),
              max: toHertz(specs.frequencyResponse.max),
            },
            driverType: specs.driverType,
          },
        }),
        ...(frGraphData && {
          frGraphData: frGraphData.map((point) => [Number(point[0]), Number(point[1])] as [number, number]),
        }),
        ...(images && {
          keepImages,
          newImages: newUploadedImages.map((img) => ({
            url: img.url,
            publicId: img.publicId,
            isPrimary: img.isPrimary,
            metadata: {
              width: img.width ?? 0,
              height: img.height ?? 0,
              format: img.format ?? 'unknown',
              bytes: img.bytes ?? 0,
            },
          })),
          deleteImageIds,
        }),
      };

      const updatedProduct = await this.productRepo.update(productId, updateInput);

      if (images && deleteImageIds.length > 0) {
        const imagesToDeleteData = currentProduct.images.filter((img) => deleteImageIds.includes(img.id));
        await Promise.all(
          imagesToDeleteData.map((img) =>
            this.mediaService
              .delete(img.publicId)
              .catch((err) => console.error(`[UpdateProductUseCase] Clean up failed: ${img.publicId}`, err)),
          ),
        );
      }

      return updatedProduct;
    } catch (error) {
      if (newUploadedImages.length > 0) {
        await Promise.all(
          newUploadedImages.map((img) =>
            this.mediaService
              .delete(img.publicId)
              .catch((err) => console.error(`[UpdateProductUseCase] Rollback failed: ${img.publicId}`, err)),
          ),
        );
      }
      throw error;
    }
  }
}

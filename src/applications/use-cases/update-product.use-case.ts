import { Injectable, NotFoundException } from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS requires importing the class itself, not just its type
import { ConfigService } from '@nestjs/config';
import slugify from 'slugify';
import type { UpdateProductDto } from '~/applications/dtos/update-product.dto';
import { ProductStatus } from '~/core/entities/product.entity';
// biome-ignore lint/style/useImportType: NestJS requires importing the class itself, not just its type
import { ProductRepository } from '~/core/repositories/product.repository';
// biome-ignore lint/style/useImportType: NestJS requires importing the class itself, not just its type
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
import type { EnvironmentVariables } from '~/infrastructure/validations/env.validation';

@Injectable()
export class UpdateProductUseCase {
  constructor(
    private readonly productRepo: ProductRepository,
    private readonly mediaService: MediaService,
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  async execute(productId: ProductId, dto: UpdateProductDto) {
    const currentProduct = await this.productRepo.findById(productId);
    if (!currentProduct) throw new NotFoundException('Product not found');

    // Classify images (Diffing)
    const imagesToKeep = dto.images?.filter((img) => img.id) || [];
    const imagesToUpload = dto.images?.filter((img) => img.file) || [];
    const keepIds = new Set(imagesToKeep.map((img) => img.id));
    const imagesToDelete = currentProduct.images.filter((img) => !keepIds.has(img.id));

    await this.productRepo.update(productId, {
      name: dto.name,
      slug: dto.name ? slugify(dto.name, { lower: true }) : undefined,
      description: dto.description,
      stock: dto.stock,
      threeModelId: dto.threeModelId,
      status: ProductStatus.DRAFT,

      // Convert Branded Types at root level
      categoryId: dto.categoryId ? toCategoryId(dto.categoryId) : undefined,
      price: dto.price ? toUsd(dto.price) : undefined,

      // Handle nested specs object
      ...(dto.specs && {
        specs: {
          impedance: toOhm(dto.specs.impedance),
          sensitivity: toDecibel(dto.specs.sensitivity),
          frequencyResponse: {
            min: toHertz(dto.specs.frequencyResponse.min),
            max: toHertz(dto.specs.frequencyResponse.max),
          },
          driverType: dto.specs.driverType,
        },
      }),

      // Handle images
      keepImages: imagesToKeep.map((img) => ({
        id: img.id as ImageId,
        isPrimary: img.isPrimary,
      })),
      newImages: imagesToUpload.map(() => ({
        url: 'pending',
        publicId: `pending_${productId}`,
        isPrimary: false,
        metadata: { width: 0, height: 0, format: 'pending', bytes: 0 },
      })),
      deleteImageIds: imagesToDelete.map((img) => img.id),
    });

    let uploadedResults: UploadMediaResponse[] = [];

    try {
      uploadedResults = await Promise.all(
        imagesToUpload.map(async (img) => this.mediaService.upload(img.file!, 'products')),
      );

      // Update DB
      const finalProduct = await this.productRepo.update(productId, {
        status: dto?.status ?? ProductStatus.DRAFT,
        newImages: uploadedResults.map((res, index) => ({
          url: res.url,
          publicId: res.publicId,
          altText: `${dto.name} ${index + 1}`,
          isPrimary: imagesToUpload[index].isPrimary,
          metadata: {
            width: res.width ?? 0,
            height: res.height ?? 0,
            format: res.format ?? 'unknown',
            bytes: res.bytes ?? 0,
          },
        })),
      });

      // 4. Cleanup Cloudinary
      if (imagesToDelete.length > 0) {
        await Promise.all(imagesToDelete.map((img) => this.mediaService.delete(img.publicId)));
      }

      return finalProduct;
    } catch (error) {
      // Rollback: Delete uploaded images
      if (uploadedResults.length > 0) {
        await Promise.all(uploadedResults.map((img) => this.mediaService.delete(img.publicId)));
      }
      if (this.configService.get('NODE_ENV') === 'development') {
        console.error('[UpdateProductUseCase] Error:', error);
      }

      throw error;
    }
  }
}

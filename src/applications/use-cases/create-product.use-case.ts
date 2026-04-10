import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import slugify from 'slugify';
import type { CreateProductDto } from '~/applications/dtos/create-product.dto';
// biome-ignore lint/style/useImportType: NestJS injects dependencies
import { CategoryRepository } from '~/core/repositories/category.repository';
// biome-ignore lint/style/useImportType: NestJS injects dependencies
import { ProductRepository } from '~/core/repositories/product.repository';
// biome-ignore lint/style/useImportType: NestJS injects dependencies
import { MediaService } from '~/core/services/media.service';
import { toCategoryId, toDecibel, toHertz, toOhm, toProductId, toUsd } from '~/core/types/branded.type';

@Injectable()
export class CreateProductUseCase {
  constructor(
    private readonly mediaService: MediaService,
    private readonly productRepo: ProductRepository,
    private readonly categoryRepo: CategoryRepository,
  ) {}

  async execute(dto: CreateProductDto) {
    const [categoryExists, productExists] = await Promise.all([
      this.categoryRepo.existsById(toCategoryId(dto.categoryId)),
      this.productRepo.existsByName(dto.name),
    ]);

    if (!categoryExists) throw new NotFoundException('Category not found');
    if (productExists) throw new BadRequestException('Product already exists');

    const uploadedImages = await Promise.all(
      dto.images.map((img) =>
        this.mediaService.upload(img.file, 'products').then((res) => ({
          ...res,
          isPrimary: img.isPrimary,
        })),
      ),
    );

    try {
      return await this.productRepo.save({
        id: toProductId(crypto.randomUUID()),
        name: dto.name,
        slug: slugify(dto.name),
        categoryId: toCategoryId(dto.categoryId),
        description: dto.description,
        price: toUsd(dto.price),
        stock: dto.stock,
        specs: {
          impedance: toOhm(dto.specs.impedance),
          sensitivity: toDecibel(dto.specs.sensitivity),
          frequencyResponse: {
            min: toHertz(dto.specs.frequencyResponse.min),
            max: toHertz(dto.specs.frequencyResponse.max),
          },
          driverType: dto.specs.driverType,
        },
        frGraphData: dto.frGraphData.map((point) => [Number(point[0]), Number(point[1])]),
        threeModelId: dto.threeModelId,
        createdAt: new Date(),
        updatedAt: new Date(),
        images: uploadedImages.map((img) => ({
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
      });
    } catch (error) {
      console.error('[CreateProductUseCase] Database save failed, starting Cloudinary rollback...', error);

      await Promise.all(
        uploadedImages.map((img) =>
          this.mediaService
            .delete(img.publicId)
            .catch((err) =>
              console.error(`[CreateProductUseCase] Failed to delete orphaned image: ${img.publicId}`, err),
            ),
        ),
      );

      throw error;
    }
  }
}

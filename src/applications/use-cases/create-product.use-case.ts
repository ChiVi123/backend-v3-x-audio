import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import slugify from 'slugify';
import type { CreateProductDto } from '~/applications/dtos/create-product.dto';
import { ProductStatus } from '~/core/entities/product.entity';
// biome-ignore lint/style/useImportType: NestJS requires importing the class itself, not just its type
import { CategoryRepository } from '~/core/repositories/category.repository';
// biome-ignore lint/style/useImportType: NestJS requires importing the class itself, not just its type
import { ProductRepository } from '~/core/repositories/product.repository';
// biome-ignore lint/style/useImportType: NestJS requires importing the class itself, not just its type
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
    const productId = toProductId(crypto.randomUUID());
    const slug = slugify(dto.name, { lower: true });

    const [categoryExists, productExists] = await Promise.all([
      this.categoryRepo.existsById(toCategoryId(dto.categoryId)),
      this.productRepo.existsByName(dto.name),
    ]);

    if (!categoryExists) throw new NotFoundException('Category not found');
    if (productExists) throw new BadRequestException('Product already exists');

    // Store product as draft and placeholder image
    const draftProduct = await this.productRepo.save({
      id: productId,
      name: dto.name,
      slug,
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
      frGraphData: dto.frGraphData.map((p) => [Number(p[0]), Number(p[1])]),
      threeModelId: dto.threeModelId,
      status: ProductStatus.DRAFT,
      aiGenerated: true,
      images: [
        {
          url: 'pending',
          publicId: `pending_${productId}`,
          isPrimary: true,
          metadata: { width: 0, height: 0, format: 'pending', bytes: 0 },
        },
      ],
    });

    // Upload Cloudinary after DB success
    try {
      const uploaded = await this.mediaService.upload(dto.images[0].file, 'products');

      // Update with real URL
      return await this.productRepo.update(productId, {
        newImages: [
          {
            url: uploaded.url,
            publicId: uploaded.publicId,
            isPrimary: true,
            metadata: {
              width: uploaded.width ?? 0,
              height: uploaded.height ?? 0,
              format: uploaded.format ?? 'unknown',
              bytes: uploaded.bytes ?? 0,
            },
          },
        ],
        deleteImageIds: draftProduct.images.map((img) => img.id),
      });
    } catch (error) {
      console.error('Cloudinary upload failed for draft product:', error);
      return draftProduct; // Still return draft for user to edit manually
    }
  }
}

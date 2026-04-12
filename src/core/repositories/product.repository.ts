import type { Image } from '~/core/entities/image.entity';
import type {
  Product,
  ProductStatus,
  ProductWithArrayImage,
  ProductWithSingleImage,
} from '~/core/entities/product.entity';
import type { CategoryId, ImageId, ProductId } from '~/core/types/branded.type';

// Remove system-generated fields when saving
export type SaveProductInput = Omit<Product, 'createdAt' | 'updatedAt'> & {
  images: Array<Pick<Image, 'url' | 'publicId'> & Partial<Image> & { isPrimary: boolean }>;
  status?: ProductStatus;
  aiGenerated?: boolean;
};

export type UpdateProductInput = Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>> & {
  status?: ProductStatus;
  keepImages?: Array<{ id: ImageId; isPrimary: boolean }>;
  newImages?: Array<Pick<Image, 'url' | 'publicId'> & Partial<Image> & { isPrimary: boolean }>;
  deleteImageIds?: ImageId[];
};

export abstract class ProductRepository {
  abstract findById(id: ProductId): Promise<ProductWithArrayImage | null>;
  abstract findByCategory(categoryId: CategoryId): Promise<ProductWithSingleImage[]>;
  abstract findAll(params: {
    categoryId?: CategoryId;
    limit?: number;
    offset?: number;
  }): Promise<ProductWithSingleImage[]>;
  abstract existsByName(name: string): Promise<boolean>;
  abstract save(product: SaveProductInput): Promise<ProductWithArrayImage>;
  abstract update(id: ProductId, input: UpdateProductInput): Promise<ProductWithArrayImage>;
  abstract delete(id: ProductId): Promise<void>;
}

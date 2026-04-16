import type { CategoryEntity } from '~/domain/entities/category.entity';
import type { ImageEntity } from '~/domain/entities/image.entity';
import type { ProductEntity } from '~/domain/entities/product.entity';
import type { ImageId, ProductId } from '~/domain/types/branded.type';

export interface ProductRepository {
  create(product: CreateProductInput): Promise<ProductWithCategoryAndMultipleImages>;
  /**
   * Update Product.
   *
   * **Important**: Careful with this interface, it's a bit complex. Create unit test for this interface.
   */
  update(id: ProductId, product: UpdateProductInput): Promise<ProductWithCategoryAndMultipleImages>;
  delete(id: ProductId): Promise<void>;
  findById(id: ProductId): Promise<ProductWithCategoryAndMultipleImages | null>;
  findAll(): Promise<ProductWithCategoryAndSingleImage[]>;
  existsByName(name: string): Promise<boolean>;
}

export interface CreateProductInput extends ProductInput {
  file: Buffer;
}

/**
 * Update Product Input.
 *
 * **Important**: Careful with this interface, it's a bit complex. Create unit test for this interface.
 * @property files - Files to upload
 * @property keepImages - Images to keep
 * @property removeImageIds - Image IDs to remove
 * @property images - Images to update
 */
export interface UpdateProductInput extends Partial<ProductInput> {
  files?: Buffer[];
  keepImages: ImageInput[];
  removeImageIds?: ImageId[];
  images?: Pick<ImageEntity, 'isPrimary'>[];
}

type ImageInput = Pick<ImageEntity, 'id' | 'isPrimary'>;

type ProductInput = Omit<ProductEntity, 'id' | 'createdAt' | 'updatedAt'>;

export interface ProductWithCategoryAndSingleImage extends Omit<ProductEntity, 'categoryId'> {
  category: CategoryEntity;
  image: ImageEntity | null;
}

export interface ProductWithCategoryAndMultipleImages extends Omit<ProductEntity, 'categoryId'> {
  category: CategoryEntity;
  images: ImageEntity[];
}

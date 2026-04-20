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
  existsById(id: ProductId): Promise<boolean>;
  existsByName(name: string): Promise<boolean>;
}

/**
 * Input for Product creation.
 */
export interface CreateProductInput extends Omit<ProductEntity, 'id' | 'createdAt' | 'updatedAt'> {
  images: Pick<ImageEntity, 'id' | 'isPrimary'>[];
}

/**
 * Update Product Input.
 */
export interface UpdateProductInput extends Partial<Omit<CreateProductInput, 'images'>> {
  /** Images to keep or update (isPrimary) */
  keepImages?: { id: ImageId; isPrimary?: boolean }[];
  /** NEW Image metadata (matches files index) */
  newImages?: { isPrimary?: boolean; alt?: string }[];
  /** IDs of images to remove from DB and Storage */
  removeImageIds?: ImageId[];
}

export type ImageInput = Pick<ImageEntity, 'id' | 'isPrimary'>;

export interface ProductWithCategoryAndSingleImage extends Omit<ProductEntity, 'categoryId'> {
  category: CategoryEntity;
  image: ImageEntity | null;
}

export interface ProductWithCategoryAndMultipleImages extends Omit<ProductEntity, 'categoryId'> {
  category: CategoryEntity;
  images: ImageEntity[];
}

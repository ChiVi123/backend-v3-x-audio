import type { Image } from '~/core/entities/image.entity';
import type { Product, ProductWithArrayImage, ProductWithSingleImage } from '~/core/entities/product.entity';
import type { CategoryId, ImageId, ProductId } from '~/core/types/branded.type';

export type SaveProductInput = Product & {
  images: Array<Pick<Image, 'url' | 'publicId'> & Partial<Image> & { isPrimary: boolean }>;
};

export type UpdateProductInput = Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>> & {
  // Ảnh cũ giữ lại và cập nhật trạng thái
  keepImages?: Array<{ id: ImageId; isPrimary: boolean }>;
  // Ảnh mới hoàn toàn
  newImages?: Array<Pick<Image, 'url' | 'publicId'> & Partial<Image> & { isPrimary: boolean }>;
  // Danh sách ID ảnh cần xóa khỏi DB
  deleteImageIds?: ImageId[];
};

export abstract class ProductRepository {
  abstract findById(id: ProductId): Promise<ProductWithArrayImage | null>;
  abstract findByCategory(categoryId: CategoryId): Promise<ProductWithSingleImage[]>;
  abstract existsByName(name: string): Promise<boolean>;
  abstract save(product: SaveProductInput): Promise<ProductWithArrayImage>;
  abstract update(id: ProductId, input: UpdateProductInput): Promise<ProductWithArrayImage>;
  abstract delete(id: ProductId): Promise<void>;
}

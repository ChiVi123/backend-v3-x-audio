import type { CategoryEntity } from '~/domain/entities/category.entity';
import type { CategoryId } from '~/domain/types/branded.type';

export interface CategoryRepository {
  update(id: CategoryId, category: { productCount: number }): Promise<CategoryEntity>;
  findById(id: CategoryId): Promise<CategoryEntity | null>;
  findAll(): Promise<CategoryEntity[]>;
  existsById(id: CategoryId): Promise<boolean>;
  existsByName(name: string): Promise<boolean>;
}

import type { Category } from '~/core/entities/category.entity';
import type { CategoryId } from '~/core/types/branded.type';

export abstract class CategoryRepository {
  abstract findAll(): Promise<Category[]>;
  abstract findById(id: CategoryId): Promise<Category | null>;
  abstract findSubCategories(parentId: CategoryId): Promise<Category[]>;
  abstract existsById(id: CategoryId): Promise<boolean>;
}

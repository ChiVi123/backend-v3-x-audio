import type { Category } from '~/core/domain/category.entity';
import type { CategoryId } from '~/core/types/branded.type';

export interface CategoryRepository {
  findAll(): Promise<Category[]>;
  findSubCategories(parentId: CategoryId): Promise<Category[]>;
}

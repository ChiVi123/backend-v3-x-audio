import type { BaseEntity } from '~/domain/entities/base.entity';
import type { CategoryId } from '~/domain/types/branded.type';

export interface CategoryEntity extends BaseEntity<CategoryId> {
  name: string;
  slug: string;
  productCount: number;
  description?: string;
  parentId?: CategoryId;
}

import type { CategoryEntity } from '~/domain/entities/category.entity';
import { toCategoryId } from '~/domain/types/branded.type';

export const CategoryMapper = {
  // biome-ignore lint/suspicious/noExplicitAny: Raw database results are often complex to type precisely without excessive boilerplate
  toDomain: (raw: any): CategoryEntity => ({
    id: toCategoryId(raw.id),
    name: raw.name,
    slug: raw.slug,
    description: raw.description ?? '',
    parentId: raw.parentId ? toCategoryId(raw.parentId) : undefined,
    productCount: raw.productCount,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt ?? undefined,
  }),
} as const;

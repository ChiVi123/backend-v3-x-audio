import { Inject, Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
// biome-ignore lint/style/useImportType: NestJS injects dependencies
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { Category } from '~/core/entities/category.entity';
import type { CategoryRepository } from '~/core/repositories/category.repository';
import { type CategoryId, toCategoryId } from '~/core/types/branded.type';
import { DRIZZLE_TOKEN } from '~/infrastructure/constants/provider-tokens';
import type { DrizzleDB } from '~/infrastructure/database/drizzle.provider';
import { categoryTable } from '~/infrastructure/database/schemas';

@Injectable()
export class DrizzleCategoryRepository implements CategoryRepository {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: NodePgDatabase<DrizzleDB>) {}

  async findAll(): Promise<Category[]> {
    const categories = await this.db.query.categoryTable.findMany();
    return categories.map((c) => ({
      ...c,
      id: toCategoryId(c.id),
      parentId: c.parentId ? toCategoryId(c.parentId) : null,
    }));
  }
  async findById(id: CategoryId): Promise<Category | null> {
    const category = await this.db.query.categoryTable.findFirst({
      where: eq(categoryTable.id, id),
    });
    if (!category) return null;
    return {
      ...category,
      id: toCategoryId(category.id),
      parentId: category.parentId ? toCategoryId(category.parentId) : null,
    };
  }
  async findSubCategories(parentId: CategoryId): Promise<Category[]> {
    const categories = await this.db.query.categoryTable.findMany({
      where: eq(categoryTable.parentId, parentId),
    });
    return categories.map((c) => ({
      ...c,
      id: toCategoryId(c.id),
      parentId: c.parentId ? toCategoryId(c.parentId) : null,
    }));
  }

  async existsById(id: CategoryId): Promise<boolean> {
    const query = sql`SELECT EXISTS (
      SELECT 1 FROM ${categoryTable} WHERE ${categoryTable.id} = ${id}
    )`;

    const result = await this.db.execute<{ exists: boolean }>(query);
    return result.rows[0].exists;
  }
}

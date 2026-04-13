import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
// biome-ignore lint/style/useImportType: NestJS requires importing the class itself, not just its type
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { Role } from '~/core/entities/role.entity';
// biome-ignore lint/style/useImportType: NestJS requires importing the class itself, not just its type
import { RoleRepository } from '~/core/repositories/role.repository';
import { DRIZZLE_TOKEN } from '~/infrastructure/constants/provider-tokens';
import type { DrizzleDB } from '~/infrastructure/database/drizzle.provider';
import { roleTable } from '~/infrastructure/database/schemas';

@Injectable()
export class DrizzleRoleRepository implements RoleRepository {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: NodePgDatabase<DrizzleDB>) {}

  async findByName(name: string): Promise<Role | null> {
    const result = await this.db.select().from(roleTable).where(eq(roleTable.name, name));
    if (result.length === 0) return null;
    return result[0];
  }
}

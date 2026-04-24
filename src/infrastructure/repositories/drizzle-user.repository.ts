import { Inject, Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { InternalServerErrorException } from '~/application/exceptions/internal-server-error.exception';
import type { CreateUserInput, UpdateUserInput, UserRepository } from '~/application/repositories/user.repository';
import type { UserEntity } from '~/domain/entities/user.entity';
import type { UserStatus } from '~/domain/enums/user.enum';
import { toUserId, toUserRoleId, type UserId } from '~/domain/types/branded.type';
import { DRIZZLE_TOKEN } from '~/infrastructure/constants/drizzle';
import type { DrizzleSchema } from '~/infrastructure/database/drizzle';
import { userTable } from '~/infrastructure/database/drizzle/schema';

const USER_COLUMNS = {
  id: true,
  email: true,
  passwordHash: true,
  fullName: true,
  avatarId: true,
  refreshTokenHash: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

const ROLE_COLUMNS = {
  id: true,
  name: true,
  description: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class DrizzleUserRepository implements UserRepository {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: NodePgDatabase<DrizzleSchema>) {}

  async findById(id: UserId): Promise<UserEntity | null> {
    const user = await this.db.query.userTable.findFirst({
      where: (t) => eq(t.id, id),
      columns: USER_COLUMNS,
      with: {
        userToRoles: {
          with: {
            role: { columns: ROLE_COLUMNS },
          },
        },
      },
    });

    if (!user) return null;
    return this.mapToEntity(user);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.db.query.userTable.findFirst({
      where: (t) => eq(t.email, email),
      columns: USER_COLUMNS,
      with: {
        userToRoles: {
          with: {
            role: { columns: ROLE_COLUMNS },
          },
        },
      },
    });

    if (!user) return null;
    return this.mapToEntity(user);
  }

  async create(input: CreateUserInput): Promise<UserEntity> {
    const result = await this.db.insert(userTable).values(input).returning();
    if (!result[0]) {
      throw new InternalServerErrorException('Failed to create user');
    }
    return this.mapToEntity(result[0]);
  }

  async update(id: UserId, input: UpdateUserInput): Promise<UserEntity> {
    const result = await this.db.update(userTable).set(input).where(eq(userTable.id, id)).returning();
    if (!result[0]) {
      throw new InternalServerErrorException('Failed to update user');
    }
    return this.mapToEntity(result[0]);
  }

  async delete(id: UserId): Promise<void> {
    await this.db.delete(userTable).where(eq(userTable.id, id));
  }

  async existsByEmail(email: string): Promise<boolean> {
    const query = sql`SELECT EXISTS (SELECT 1 FROM ${userTable} WHERE ${userTable.email} = ${email})`;
    const result = await this.db.execute<{ exists: boolean }>(query);
    return result.rows[0].exists;
  }

  async existsById(id: UserId): Promise<boolean> {
    const query = sql`SELECT EXISTS (SELECT 1 FROM ${userTable} WHERE ${userTable.id} = ${id})`;
    const result = await this.db.execute<{ exists: boolean }>(query);
    return result.rows[0].exists;
  }

  // biome-ignore lint/suspicious/noExplicitAny: Raw database results are often complex to type precisely without excessive boilerplate
  private mapToEntity(raw: any): UserEntity {
    return {
      id: toUserId(raw.id),
      email: raw.email,
      passwordHash: raw.passwordHash,
      fullName: raw.fullName,
      avatarId: raw.avatarId ?? undefined,
      refreshTokenHash: raw.refreshTokenHash ?? undefined,
      status: raw.status as UserStatus,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt ?? undefined,
      roles: (raw.userToRoles ?? []).map(({ role }: any) => ({
        id: toUserRoleId(role.id),
        name: role.name,
        description: role.description ?? undefined,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt ?? undefined,
      })),
    };
  }
}

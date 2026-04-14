import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
// biome-ignore lint/style/useImportType: NestJS requires importing the class itself, not just its type
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { User, UserStatus, UserWithRolesAndAvatar } from '~/core/entities/user.entity';
import type { UserRepository } from '~/core/repositories/user.repository';
import type { UserId } from '~/core/types/branded.type';
import { DRIZZLE_TOKEN } from '~/infrastructure/constants/provider-tokens';
import type { DrizzleDB } from '~/infrastructure/database/drizzle.provider';
import { imageTable, roleTable, userRoleTable, userTable } from '~/infrastructure/database/schemas';

@Injectable()
export class DrizzleUserRepository implements UserRepository {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: NodePgDatabase<DrizzleDB>) {}

  async findByEmail(email: string): Promise<UserWithRolesAndAvatar | null> {
    const result = await this.queryUserWithRolesAndAvatar().where(eq(userTable.email, email));
    if (result.length === 0) return null;

    return this.mapQueryResult(result);
  }

  async findById(id: UserId): Promise<UserWithRolesAndAvatar | null> {
    const result = await this.queryUserWithRolesAndAvatar().where(eq(userTable.id, id));
    if (result.length === 0) return null;

    return this.mapQueryResult(result);
  }

  async save(user: User, roleIds: string[]): Promise<UserWithRolesAndAvatar> {
    await this.db.transaction(async (tx) => {
      await tx.insert(userTable).values(user);

      if (roleIds.length > 0) {
        await tx.insert(userRoleTable).values(
          roleIds.map((roleId) => ({
            userId: user.id,
            roleId,
          })),
        );
      }
    });

    const savedUser = await this.findById(user.id);
    if (!savedUser) throw new Error('Failed to save user');
    return savedUser;
  }

  async update(id: UserId, data: Partial<User>, roleIds?: string[]): Promise<UserWithRolesAndAvatar> {
    await this.db.transaction(async (tx) => {
      if (Object.keys(data).length > 0) {
        await tx.update(userTable).set(data).where(eq(userTable.id, id));
      }

      if (roleIds) {
        await tx.delete(userRoleTable).where(eq(userRoleTable.userId, id));
        if (roleIds.length > 0) {
          await tx.insert(userRoleTable).values(
            roleIds.map((roleId) => ({
              userId: id,
              roleId,
            })),
          );
        }
      }
    });

    const updatedUser = await this.findById(id);
    if (!updatedUser) throw new Error('User not found after update');
    return updatedUser;
  }

  private queryUserWithRolesAndAvatar() {
    return this.db
      .select({
        user: userTable,
        role: roleTable,
        avatar: imageTable,
      })
      .from(userTable)
      .leftJoin(userRoleTable, eq(userTable.id, userRoleTable.userId))
      .leftJoin(roleTable, eq(userRoleTable.roleId, roleTable.id))
      .leftJoin(imageTable, eq(userTable.avatarImageId, imageTable.id));
  }

  private mapQueryResult(
    result: {
      user: typeof userTable.$inferSelect;
      role: typeof roleTable.$inferSelect | null;
      avatar: typeof imageTable.$inferSelect | null;
    }[],
  ): UserWithRolesAndAvatar | null {
    if (result.length === 0) return null;

    const user = result[0].user;
    const avatar = result[0].avatar;
    const roles = result.map((r) => r.role).filter((role): role is NonNullable<typeof role> => role !== null);

    return { ...user, status: user.status as UserStatus, roles, avatar };
  }
}

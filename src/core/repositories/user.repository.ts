import type { User, UserWithRolesAndAvatar } from '~/core/entities/user.entity';
import type { UserId } from '~/core/types/branded.type';

export abstract class UserRepository {
  abstract findById(id: UserId): Promise<UserWithRolesAndAvatar | null>;
  abstract findByEmail(email: string): Promise<UserWithRolesAndAvatar | null>;
  abstract save(user: User, roleIds: string[]): Promise<UserWithRolesAndAvatar>;
  abstract update(id: UserId, data: Partial<User>, roleIds?: string[]): Promise<UserWithRolesAndAvatar>;
}

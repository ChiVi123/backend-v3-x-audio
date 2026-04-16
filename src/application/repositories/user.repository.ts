import type { ImageEntity } from '~/domain/entities/image.entity';
import type { UserEntity } from '~/domain/entities/user.entity';
import type { UserRoleEntity } from '~/domain/entities/user-role.entity';
import type { UserId } from '~/domain/types/branded.type';

export interface UserRepository {
  findById(id: UserId): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  create(user: CreateUserInput): Promise<UserEntity>;
  update(id: UserId, user: UpdateUserInput): Promise<UserEntity>;
  delete(id: UserId): Promise<void>;
}

type CreateUserInput = Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateUserInput = Partial<Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>>;

export interface UserWithRolesAndAvatar extends UserEntity {
  roles: UserRoleEntity[];
  avatar?: ImageEntity;
}

import type { ImageEntity } from '~/domain/entities/image.entity';
import type { RoleEntity } from '~/domain/entities/role.entity';
import type { UserEntity } from '~/domain/entities/user.entity';
import type { UserId } from '~/domain/types/branded.type';

export type CreateUserInput = Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt' | 'roles'>;
export type UpdateUserInput = Partial<Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt' | 'roles'>>;

export interface UserRepository {
  findById(id: UserId): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  create(user: CreateUserInput): Promise<UserEntity>;
  update(id: UserId, user: UpdateUserInput): Promise<UserEntity>;
  delete(id: UserId): Promise<void>;
  existsByEmail(email: string): Promise<boolean>;
  existsById(id: UserId): Promise<boolean>;
}

export interface UserWithRolesAndAvatar extends UserEntity {
  roles: RoleEntity[];
  avatar?: ImageEntity;
}

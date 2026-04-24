import type { BaseEntity } from '~/domain/entities/base.entity';
import type { RoleEntity } from '~/domain/entities/role.entity';
import type { UserStatus } from '~/domain/enums/user.enum';
import type { ImageId, UserId } from '~/domain/types/branded.type';

export interface UserEntity extends BaseEntity<UserId> {
  email: string;
  passwordHash: string;
  fullName: string;
  avatarId?: ImageId;
  refreshTokenHash?: string;
  status: UserStatus;
  roles?: RoleEntity[];
}

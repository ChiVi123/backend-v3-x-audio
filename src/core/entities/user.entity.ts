import type { Image } from '~/core/entities/image.entity';
import type { Role } from '~/core/entities/role.entity';
import type { ImageId, UserId } from '~/core/types/branded.type';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked',
}

export interface User {
  id: UserId;
  email: string;
  passwordHash: string;
  fullName: string;
  avatarImageId?: ImageId | null;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithRolesAndAvatar extends User {
  avatar: Image | null;
  roles: Role[];
}

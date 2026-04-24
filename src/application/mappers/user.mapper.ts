import { ImageMapper } from '~/application/mappers/image.mapper';
import type { UserWithRolesAndAvatar } from '~/application/repositories/user.repository';

export const UserMapper = {
  toResponse(user: UserWithRolesAndAvatar) {
    const { passwordHash, refreshTokenHash, ...safeUser } = user;

    return {
      ...safeUser,
      avatar: user.avatar ? ImageMapper.toResponse(user.avatar) : undefined,
      roles: user.roles?.map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description,
      })),
    };
  },
} as const;

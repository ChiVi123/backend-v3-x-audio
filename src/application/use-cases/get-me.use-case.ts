import { NotFoundException } from '~/application/exceptions/not-found.exception';
import type { UserRepository, UserWithRolesAndAvatar } from '~/application/repositories/user.repository';
import type { UserId } from '~/domain/types/branded.type';

export class GetMeUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: UserId): Promise<UserWithRolesAndAvatar> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User', 'id', id);
    }
    return { ...user, roles: user.roles ?? [], avatar: undefined };
  }
}

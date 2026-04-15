// src/applications/use-cases/logout.use-case.ts
import { Injectable } from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS requires importing the class itself, not just its type
import { UserRepository } from '~/core/repositories/user.repository';
import type { UserId } from '~/core/types/branded.type';

@Injectable()
export class LogoutUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(userId: UserId): Promise<void> {
    await this.userRepo.update(userId, { refreshTokenHash: null });
  }
}

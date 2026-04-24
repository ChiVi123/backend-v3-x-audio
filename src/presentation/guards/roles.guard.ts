import { type CanActivate, type ExecutionContext, Inject, Injectable } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { ForbiddenException } from '~/application/exceptions/forbidden.exception';
import type { UserRepository } from '~/application/repositories/user.repository';
import type { TokenPayload } from '~/application/services/auth.service';
import type { UserId } from '~/domain/types/branded.type';
import { USER_REPOSITORY_TOKEN } from '~/infrastructure/constants/provider-token';
import { ROLES_KEY } from '~/presentation/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(USER_REPOSITORY_TOKEN) private readonly userRepository: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userPayload = request.user as TokenPayload;

    if (!userPayload?.sub) {
      throw new ForbiddenException('User is not authenticated');
    }

    const user = await this.userRepository.findById(userPayload.sub as UserId);
    if (!user?.roles) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const userRoles = user.roles.map((role) => role.name);
    const hasRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}

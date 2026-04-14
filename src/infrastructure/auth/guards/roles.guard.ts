import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS requires importing the class itself, not just its type
import { Reflector } from '@nestjs/core';
import type { UserWithRolesAndAvatar } from '~/core/entities/user.entity';
import { ROLES_KEY } from '~/infrastructure/decorators/auth-roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{ user: UserWithRolesAndAvatar }>();

    if (!user?.roles) {
      return false;
    }

    const hasRole = requiredRoles.some((role) => user.roles.some((userRole) => userRole.name === role));
    return !!hasRole;
  }
}

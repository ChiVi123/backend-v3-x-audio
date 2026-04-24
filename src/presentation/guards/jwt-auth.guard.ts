import { type CanActivate, type ExecutionContext, Inject, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { UnauthorizedException } from '~/application/exceptions/unauthorized.exception';
import type { AuthService } from '~/application/services/auth.service';
import { AUTH_SERVICE_TOKEN } from '~/infrastructure/constants/provider-token';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(@Inject(AUTH_SERVICE_TOKEN) private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    try {
      const payload = await this.authService.verifyAccessToken(token);
      // biome-ignore lint/suspicious/noExplicitAny: Express Request object can be extended with custom properties
      (request as any).user = payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

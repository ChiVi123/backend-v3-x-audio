import { Injectable, UnauthorizedException } from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS requires importing the class itself, not just its type
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
// biome-ignore lint/style/useImportType: NestJS requires importing the class itself, not just its type
import { UserRepository } from '~/core/repositories/user.repository';
import type { UserId } from '~/core/types/branded.type';
import type { EnvironmentVariables } from '~/infrastructure/validations/env.validation';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    // biome-ignore lint/correctness/noUnusedPrivateClassMembers: In super can not use this.configService, so I need to pass it like a parameter
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly userRepo: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', { infer: true }) ?? 'secret',
    });
  }

  async validate(payload: { sub: UserId; email: string }) {
    const user = await this.userRepo.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}

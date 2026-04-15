import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS requires importing the class itself, not just its type
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
// biome-ignore lint/style/useImportType: NestJS requires importing the class itself, not just its type
import { UserRepository } from '~/core/repositories/user.repository';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly jwtService: JwtService,
    @Inject('REFRESH_JWT_SERVICE') private readonly refreshJwtService: JwtService,
  ) {}

  async execute(refreshToken: string) {
    try {
      const payload = await this.refreshJwtService.verifyAsync(refreshToken);

      const user = await this.userRepo.findById(payload.sub);
      if (!user?.refreshTokenHash) throw new UnauthorizedException();

      const isMatch = await bcrypt.compare(refreshToken, user.refreshTokenHash);
      if (!isMatch) throw new UnauthorizedException();

      const newAccessToken = await this.jwtService.signAsync({
        sub: user.id,
        email: user.email,
        roles: user.roles.map((r) => r.name),
      });

      return { access_token: newAccessToken };
    } catch {
      throw new UnauthorizedException();
    }
  }
}

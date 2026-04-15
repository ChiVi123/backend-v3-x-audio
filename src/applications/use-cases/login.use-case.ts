import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS requires importing the class itself, not just its type
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { LoginDto } from '~/applications/dtos/login.dto';
// biome-ignore lint/style/useImportType: NestJS requires importing the class itself, not just its type
import { UserRepository } from '~/core/repositories/user.repository';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly jwtService: JwtService,
    @Inject('REFRESH_JWT_SERVICE') private readonly refreshJwtService: JwtService,
  ) {}

  // Cập nhật LoginUseCase
  async execute(dto: LoginDto) {
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, roles: user.roles.map((r) => r.name) };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.refreshJwtService.signAsync({ sub: user.id }),
    ]);

    const salt = await bcrypt.genSalt();
    const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);
    await this.userRepo.update(user.id, { refreshTokenHash: hashedRefreshToken });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: { id: user.id, email: user.email, fullName: user.fullName, roles: payload.roles },
    };
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
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
  ) {}

  async execute(dto: LoginDto) {
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map((r) => r.name),
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        roles: user.roles,
        avatar: user.avatar,
      },
    };
  }
}

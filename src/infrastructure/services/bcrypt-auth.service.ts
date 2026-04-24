import { Injectable } from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS DI requires class imports, not type imports
import { ConfigService } from '@nestjs/config';
// biome-ignore lint/style/useImportType: NestJS DI requires class imports, not type imports
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { StringValue } from 'ms';
import { UnauthorizedException } from '~/application/exceptions/unauthorized.exception';
import type { AuthService, AuthTokens, TokenPayload } from '~/application/services/auth.service';

const SALT_ROUNDS = 12;

@Injectable()
export class BcryptAuthService implements AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async generateTokens(payload: TokenPayload): Promise<AuthTokens> {
    const accessSecret = this.configService.getOrThrow<string>('JWT_ACCESS_SECRET');
    const refreshSecret = this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
    const accessExpiresIn = this.configService.get<StringValue>('JWT_ACCESS_EXPIRES_IN', '15m');
    const refreshExpiresIn = this.configService.get<StringValue>('JWT_REFRESH_EXPIRES_IN', '7d');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { secret: accessSecret, expiresIn: accessExpiresIn }),
      this.jwtService.signAsync(payload, { secret: refreshSecret, expiresIn: refreshExpiresIn }),
    ]);

    return { accessToken, refreshToken };
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    try {
      const secret = this.configService.getOrThrow<string>('JWT_ACCESS_SECRET');
      return await this.jwtService.verifyAsync<TokenPayload>(token, { secret });
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload> {
    try {
      const secret = this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
      return await this.jwtService.verifyAsync<TokenPayload>(token, { secret });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}

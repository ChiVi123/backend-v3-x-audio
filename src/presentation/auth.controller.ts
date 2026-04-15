import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import type { LoginDto } from '~/applications/dtos/login.dto';
import type { RegisterUserDto } from '~/applications/dtos/register-user.dto';
// biome-ignore lint/style/useImportType: NestJS requires importing the class itself
import { LoginUseCase } from '~/applications/use-cases/login.use-case';
// biome-ignore lint/style/useImportType: NestJS requires importing the class itself
import { LogoutUseCase } from '~/applications/use-cases/logout.use-case';
// biome-ignore lint/style/useImportType: NestJS requires importing the class itself
import { RefreshTokenUseCase } from '~/applications/use-cases/refresh-token.use-case';
// biome-ignore lint/style/useImportType: NestJS requires importing the class itself
import { RegisterUseCase } from '~/applications/use-cases/register.use-case';
import type { UserId } from '~/core/types/branded.type';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    return this.registerUseCase.execute(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body('refresh_token') refreshToken: string) {
    return this.refreshTokenUseCase.execute(refreshToken);
  }

  @Get('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Param('userId') userId: UserId) {
    return this.logoutUseCase.execute(userId);
  }
}

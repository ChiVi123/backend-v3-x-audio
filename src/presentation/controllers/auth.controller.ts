import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { UserMapper } from '~/application/mappers/user.mapper';
// biome-ignore lint/style/useImportType: NestJS doesn't support type-only imports for classes
import { GetMeUseCase } from '~/application/use-cases/get-me.use-case';
// biome-ignore lint/style/useImportType: NestJS doesn't support type-only imports for classes
import { LoginUserUseCase } from '~/application/use-cases/login-user.use-case';
// biome-ignore lint/style/useImportType: NestJS doesn't support type-only imports for classes
import { RegisterUserUseCase } from '~/application/use-cases/register-user.use-case';
import type { UserId } from '~/domain/types/branded.type';
import { CurrentUser } from '~/presentation/decorators/current-user.decorator';
// biome-ignore lint/style/useImportType: NestJS doesn't support type-only imports for classes
import { LoginUserDto } from '~/presentation/dtos/auth/login-user.dto';
// biome-ignore lint/style/useImportType: NestJS doesn't support type-only imports for classes
import { RegisterUserDto } from '~/presentation/dtos/auth/register-user.dto';
import { JwtAuthGuard } from '~/presentation/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly getMeUseCase: GetMeUseCase,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    const result = await this.registerUserUseCase.execute(dto);
    return UserMapper.toResponse(result);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginUserDto) {
    const result = await this.loginUserUseCase.execute(dto);
    return {
      user: UserMapper.toResponse(result.user),
      tokens: result.tokens,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@CurrentUser('sub') userId: string) {
    const result = await this.getMeUseCase.execute(userId as UserId);
    return UserMapper.toResponse(result);
  }
}

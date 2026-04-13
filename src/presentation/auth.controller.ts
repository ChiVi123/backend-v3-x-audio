import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import type { LoginDto } from '~/applications/dtos/login.dto';
import type { RegisterUserDto } from '~/applications/dtos/register-user.dto';
// biome-ignore lint/style/useImportType: NestJS requires importing the class itself
import { LoginUseCase } from '~/applications/use-cases/login.use-case';
// biome-ignore lint/style/useImportType: NestJS requires importing the class itself
import { RegisterUseCase } from '~/applications/use-cases/register.use-case';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
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
}

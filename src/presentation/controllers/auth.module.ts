import { Module } from '@nestjs/common';
import type { UserRepository } from '~/application/repositories/user.repository';
import type { AuthService } from '~/application/services/auth.service';
import { GetMeUseCase } from '~/application/use-cases/get-me.use-case';
import { LoginUserUseCase } from '~/application/use-cases/login-user.use-case';
import { RegisterUserUseCase } from '~/application/use-cases/register-user.use-case';
import { AUTH_SERVICE_TOKEN, USER_REPOSITORY_TOKEN } from '~/infrastructure/constants/provider-token';
import { AuthController } from '~/presentation/controllers/auth.controller';

@Module({
  controllers: [AuthController],
  providers: [
    {
      provide: RegisterUserUseCase,
      useFactory: (userRepository: UserRepository, authService: AuthService) =>
        new RegisterUserUseCase(userRepository, authService),
      inject: [USER_REPOSITORY_TOKEN, AUTH_SERVICE_TOKEN],
    },
    {
      provide: LoginUserUseCase,
      useFactory: (userRepository: UserRepository, authService: AuthService) =>
        new LoginUserUseCase(userRepository, authService),
      inject: [USER_REPOSITORY_TOKEN, AUTH_SERVICE_TOKEN],
    },
    {
      provide: GetMeUseCase,
      useFactory: (userRepository: UserRepository) => new GetMeUseCase(userRepository),
      inject: [USER_REPOSITORY_TOKEN],
    },
  ],
})
export class AuthModule {}

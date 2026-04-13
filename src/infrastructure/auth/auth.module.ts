import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LoginUseCase } from '~/applications/use-cases/login.use-case';
import { RegisterUseCase } from '~/applications/use-cases/register.use-case';
import { RoleRepository } from '~/core/repositories/role.repository';
import { UserRepository } from '~/core/repositories/user.repository';
import { RolesGuard } from '~/infrastructure/auth/guards/roles.guard';
import { JwtStrategy } from '~/infrastructure/auth/strategies/jwt.strategy';
import { DrizzleRoleRepository } from '~/infrastructure/repositories/drizzle-role.repository';
import { DrizzleUserRepository } from '~/infrastructure/repositories/drizzle-user.repository';
import type { EnvironmentVariables } from '~/infrastructure/validations/env.validation';
import { AuthController } from '~/presentation/auth.controller';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvironmentVariables>) => ({
        secret: configService.get('JWT_SECRET', { infer: true }),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', { infer: true }),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    RegisterUseCase,
    LoginUseCase,
    JwtStrategy,
    {
      provide: UserRepository,
      useClass: DrizzleUserRepository,
    },
    {
      provide: RoleRepository,
      useClass: DrizzleRoleRepository,
    },
    RolesGuard,
  ],
  exports: [RegisterUseCase, LoginUseCase],
})
export class AuthModule {}

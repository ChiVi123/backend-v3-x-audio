import { Global, Logger, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import type { LoggerService } from '~/application/services/logger.service';
import { AUTH_SERVICE_TOKEN, LOGGER_SERVICE_TOKEN, SLUGIFY_SERVICE_TOKEN } from '~/infrastructure/constants/provider-token';
import { BcryptAuthService } from '~/infrastructure/services/bcrypt-auth.service';
import { LoggerServiceImpl } from '~/infrastructure/services/logger.service';
import { SlugifyServiceImpl } from '~/infrastructure/services/slugify.service';

@Global()
@Module({
  imports: [JwtModule.register({})],
  providers: [
    {
      provide: LOGGER_SERVICE_TOKEN,
      useFactory: () => ({ create: (context: string) => new LoggerServiceImpl(new Logger(context)) }),
    },
    {
      provide: SLUGIFY_SERVICE_TOKEN,
      useClass: SlugifyServiceImpl,
    },
    {
      provide: AUTH_SERVICE_TOKEN,
      useClass: BcryptAuthService,
    },
  ],
  exports: [LOGGER_SERVICE_TOKEN, SLUGIFY_SERVICE_TOKEN, AUTH_SERVICE_TOKEN],
})
export class ServiceModule {}

export interface LoggerFactory {
  create(context: string): LoggerService;
}

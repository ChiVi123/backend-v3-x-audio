import { Global, Logger, Module } from '@nestjs/common';
import type { LoggerService } from '~/application/services/logger.service';
import { LOGGER_SERVICE_TOKEN, SLUGIFY_SERVICE_TOKEN } from '~/infrastructure/constants/provider-token';
import { LoggerServiceImpl } from '~/infrastructure/services/logger.service';
import { SlugifyServiceImpl } from '~/infrastructure/services/slugify.service';

@Global()
@Module({
  providers: [
    {
      provide: LOGGER_SERVICE_TOKEN,
      useFactory: () => ({ create: (context: string) => new LoggerServiceImpl(new Logger(context)) }),
    },
    {
      provide: SLUGIFY_SERVICE_TOKEN,
      useClass: SlugifyServiceImpl,
    },
  ],
  exports: [LOGGER_SERVICE_TOKEN, SLUGIFY_SERVICE_TOKEN],
})
export class ServiceModule {}

export interface LoggerFactory {
  create(context: string): LoggerService;
}

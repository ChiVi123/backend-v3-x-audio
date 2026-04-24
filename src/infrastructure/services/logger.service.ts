/** biome-ignore-all lint/suspicious/noExplicitAny: false positive */
import { Injectable, type Logger } from '@nestjs/common';
import type { LoggerService } from '~/application/services/logger.service';

@Injectable()
export class LoggerServiceImpl implements LoggerService {
  constructor(private readonly logger: Logger) {}

  log(message: any, ...optionalParams: any[]): void {
    this.logger.log(message, ...optionalParams);
  }
  error(message: any, ...optionalParams: any[]): void {
    this.logger.error(message, ...optionalParams);
  }
}

import { Injectable } from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS requires importing the class itself, not just its type
import { ConfigService } from '@nestjs/config';
import type { EnvironmentVariables } from '~/validations/env.validation';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService<EnvironmentVariables>) {}

  getHello(): string {
    return `Hello World! ${this.configService.get('NODE_ENV', { infer: true })}`;
  }
}

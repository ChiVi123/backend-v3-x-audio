import { Global, Module } from '@nestjs/common';
import { DRIZZLE_TOKEN } from '~/constants/provider-tokens';
import { DrizzleProvider } from '~/infrastructure/database/drizzle.provider';

@Global()
@Module({
  providers: [DrizzleProvider],
  exports: [DRIZZLE_TOKEN],
})
export class DatabaseModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from '~/app.controller';
import { AppService } from '~/app.service';
import { validateEnv } from '~/config/env.validation';
import { DatabaseModule } from '~/infrastructure/database/database.module';
import { ServiceModule } from '~/infrastructure/services/service.module';
import { ProductModule } from '~/presentation/controllers/product.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.test.local'],
      validate: validateEnv,
      isGlobal: true,
    }),
    ServiceModule,
    DatabaseModule,
    ProductModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

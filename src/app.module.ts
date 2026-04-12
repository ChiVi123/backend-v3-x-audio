import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from '~/app.controller';
import { AppService } from '~/app.service';
import { DatabaseModule } from '~/infrastructure/database/drizzle.module';
import { MediaModule } from '~/infrastructure/services/media/media.module';
import { ImageGarbageCollector } from '~/infrastructure/tasks/image-garbage-collector.service';
import { validate } from '~/infrastructure/validations/env.validation';
import { ProductModule } from '~/presentation/product.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV}.local`, '.env.local', '.env'],
      isGlobal: true,
      validate,
    }),
    ProductModule,
    DatabaseModule,
    MediaModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, ImageGarbageCollector],
})
export class AppModule {}

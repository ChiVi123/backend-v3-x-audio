import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { GlobalExceptionsFilter } from '~/config/global-exception.filter';
import { AppModule } from './app.module';
import type { EnvironmentVariables } from './config/env.validation';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService<EnvironmentVariables>);
  const port = config.get('PORT', { infer: true }) ?? 3000;

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new GlobalExceptionsFilter());
  await app.listen(port);

  Logger.log(`Environment: ${config.get('NODE_ENV', { infer: true })}`, 'Bootstrap');
  Logger.log(`Application is running on: http://localhost:${port}`, 'Bootstrap');
  Logger.log('Press "q" and "Enter" to close the application', 'Bootstrap');

  process.stdin.on('data', (data) => {
    const key = data.toString().trim().toLowerCase();
    if (key === 'q') {
      app.close().then(() => {
        Logger.log('Application closed gracefully', 'Bootstrap');
        process.exit(0);
      });
    }
  });
}
bootstrap();

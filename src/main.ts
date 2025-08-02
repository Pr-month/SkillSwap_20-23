import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionFilter } from './common/all-exception.filter';
import { WinstonLogger } from './logger/winston-logger';
import { ConfigService } from '@nestjs/config';
import { IAppConfig } from './config/config.types';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, // Важно для корректной работы кастомного логгера
    logger: new WinstonLogger(),
  });

  const configService = app.get(ConfigService);
  const appConfig = configService.get<IAppConfig>('APP') || {
    port: 3000,
    env: 'development',
    fileUploads: {
      destination: './public/uploads',
      limit: 2097152,
    },
  };
  const logger = app.get(WinstonLogger);

  app.useLogger(logger);
  app.useGlobalFilters(new AllExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // удаляет все свойства, которых нет в DTO
      forbidNonWhitelisted: true, // выбрасывает ошибку, если есть лишние поля
      transform: true, // автоматически преобразует payload к типу DTO
    }),
  );

  logger.log(`Environment: ${appConfig.env}`, 'Bootstrap'); //логирование окружения
  logger.log(`Starting server on port ${appConfig.port}...`, 'Bootstrap');

  await app.listen(appConfig.port);

  logger.log(
    `Server successfully started and listening on http://localhost:${appConfig.port}`,
    'Bootstrap',
  );
}

// ЗАТЫЧКА ЛИНТИНГА
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap().catch((error) => {
  console.error('Error starting application:', error);
  process.exit(1);
});

import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WinstonLogger } from './logger/winston-logger';

async function bootstrap() {
  dotenv.config();
  //const app = await NestFactory.create(AppModule);

  // Создание приложения с буферизацией логов
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, // Важно для корректной работы кастомного логгера
  });

   // Получаем экземпляры сервисов
  //const configService = app.get(ConfigService);
  const logger = app.get(WinstonLogger);

  // Устанавливаем глобальный логгер
  app.useLogger(logger);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // удаляет все свойства, которых нет в DTO
      forbidNonWhitelisted: true, // выбрасывает ошибку, если есть лишние поля
      transform: true, // автоматически преобразует payload к типу DTO
    }),
  );

  logger.log(`Application started on port ${process.env.PORT || 3000}`, 'Bootstrap'); //логирование порта приложения
  logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`, 'Bootstrap'); //логирование окружения
  await app.listen(process.env.PORT ?? 3000);
}

// ЗАТЫЧКА ЛИНТИНГА
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();

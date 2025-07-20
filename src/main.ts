import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false, // удаляет все свойства, которых нет в DTO
      forbidNonWhitelisted: false, // выбрасывает ошибку, если есть лишние поля
      transform: true, // автоматически преобразует payload к типу DTO
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}

// ЗАТЫЧКА ЛИНТИНГА
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
   app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // удаляет все свойства, которых нет в DTO 
      forbidNonWhitelisted: true, // выбрасывает ошибку, если есть лишние поля
      transform: true, // автоматически преобразует payload к типу DTO
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
// ЗАТЫЧКА ЛИНТИНГА
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();

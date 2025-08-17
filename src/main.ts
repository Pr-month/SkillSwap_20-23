import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import { AllExceptionFilter } from './common/all-exception.filter';
import { IAppConfig } from './config/config.types';
import { WinstonLogger } from './logger/winston-logger';
import { MulterExceptionFilter } from './upload/utils/multer-exception.filter';

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

  const configSwagger = new DocumentBuilder()
    .setTitle('API SkillSwap')
    .setDescription('Документация API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Введите JWT токен',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const documentSwagger = SwaggerModule.createDocument(app, configSwagger);

  SwaggerModule.setup('api/docs', app, documentSwagger);
  const logger = app.get(WinstonLogger);

  app.useLogger(logger);
  app.useGlobalFilters(new AllExceptionFilter(), new MulterExceptionFilter());
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
bootstrap().catch((error) => {
  console.error('Error starting application:', error);
  process.exit(1);
});

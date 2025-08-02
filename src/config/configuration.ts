import { registerAs } from '@nestjs/config';
import { dbConfig } from './db.config';
import { jwtConfig } from './jwt.config';
import { postgresConfig } from './db.config';
import { pgAdminConfig } from './db.config';

// Этот файл теперь будет просто объединять все конфигурации
// Можно оставить его для обратной совместимости или удалить, если не нужен

export const configuration = registerAs('LEGACY_CONFIG', () => ({
  // Приложение
  port: Number(process.env.PORT) || 3000,
  env: process.env.NODE_ENV || 'development',

  // База данных
  db: dbConfig(),

  // postgres
  postgres: postgresConfig(),

  // pgAdmin
  pgadmin: pgAdminConfig(),

  // JWT токены
  jwt: jwtConfig(),

  // Работа с файлами
  fileUploads: {
    destination: process.env.FILE_UPLOAD_DEST || './public/uploads',
    limit: parseInt(process.env.FILE_UPLOAD_LIMIT || '2097152', 10),
  },
}));

//Для использования конфигурации в сервисах можно делать так:
/* import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IJwtConfig } from '../config/config.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
  ) {
    const jwtConfig = this.configService.get<IJwtConfig>('JWT');
    // используем jwtConfig.accessSecret и т.д.
  }
}*/
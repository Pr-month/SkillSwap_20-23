import { registerAs } from '@nestjs/config';
import { dbConfig } from './db-config';

export const configuration = registerAs('APP_CONFIG', () => ({
  // Приложение
  port: Number(process.env.PORT) || 3000,
  env: process.env.NODE_ENV || 'development',

  // База данных
  db: dbConfig,

  // postgres
  postgres: {
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    db: process.env.POSTGRES_DB || 'postgres',
  },

  // pgAdmin
  pgadmin: {
    email: process.env.PGADMIN_DEFAULT_EMAIL || 'postgres@localhost.net',
    password: process.env.PGADMIN_DEFAULT_PASSWORD || 'postgres',
  },

  // JWT токены
  jwt: {
    accessSecret:
      process.env.JWT_ACCESS_SECRET || 'KRlU9fLKrS9rNmcDkqFibX1c99I',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'test',
    accessExpiration: process.env.JWT_EXPIRATION || '3600s',
    refreshExpiration: process.env.REFRESH_TOKEN_EXPIRATION || '2h',
   }
  // Работа с файлами
  fileUploads: {
    destination: process.env.FILE_UPLOAD_DEST || './public/uploads',
    limit: parseInt(process.env.FILE_UPLOAD_LIMIT || '2097152', 10),
  },
}));

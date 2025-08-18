import { registerAs } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';

export const dbConfig = registerAs(
  'DB',
  (): DataSourceOptions => ({
    type: 'postgres',
    applicationName: 'skillswap',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'skillswap',
    username: process.env.DB_USER || 'skillswapuser',
    password: process.env.DB_PASSWORD || 'skillswapuserpassword',
    synchronize: process.env.SYNCHRONIZE === 'true',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    //ropSchema: process.env.NODE_ENV === 'test',
  }),
);

export const pgAdminConfig = registerAs('PG_ADMIN', () => ({
  email: process.env.PGADMIN_DEFAULT_EMAIL || 'postgres@localhost.net',
  password: process.env.PGADMIN_DEFAULT_PASSWORD || 'postgres',
}));

export const postgresConfig = registerAs('POSTGRES', () => ({
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  db: process.env.POSTGRES_DB || 'postgres',
}));

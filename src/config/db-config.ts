import * as dotenv from 'dotenv';
import { DataSourceOptions } from 'typeorm';

dotenv.config();

export const dbConfig: DataSourceOptions = {
  type: 'postgres',
  applicationName: 'skillswap',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'skillswap',
  username: process.env.DB_USER || 'skillswapuser',
  password: process.env.DB_PASSWORD || 'skillswapuserpassword',
};

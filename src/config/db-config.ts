import { DataSourceOptions } from 'typeorm';

export const dbConfig: DataSourceOptions = {
  type: 'postgres',
  applicationName: 'skillswap',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'skillswap',
  username: process.env.DB_USER || 'skillswapuser',
  // password: process.env.DB_PASSWORD || 'your_password',
  password: process.env.DB_PASSWORD || 'skillswapuserpassword',
};

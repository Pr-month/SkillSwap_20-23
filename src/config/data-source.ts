import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { dbConfig } from './db.config';

const dotenvConfigPath = process.env.NODE_ENV
  ? `./.env.${process.env.NODE_ENV}`
  : './.env';
dotenv.config({ path: dotenvConfigPath });

export const AppDataSource = new DataSource(dbConfig());

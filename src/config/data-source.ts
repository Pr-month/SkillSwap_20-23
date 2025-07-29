import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { dbConfig } from './db-config';

dotenv.config();

export const AppDataSource = new DataSource({
  ...dbConfig,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: Boolean(process.env.SYNCHRONIZE),
});

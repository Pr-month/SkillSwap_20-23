import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from './users/entities/user.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD) || 'postgres',
  database: process.env.DB_NAME,
  // entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  entities: [User],
  synchronize: true,
  logging: true,
});

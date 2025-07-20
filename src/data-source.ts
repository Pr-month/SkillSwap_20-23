import { DataSource } from 'typeorm';
import { User } from './users/entities/user.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: 'postgres',
  // password: String(process.env.DB_PASSWORD) || 'postgres', // Эта строка вызывает ошибку
  database: process.env.DB_NAME || 'skillswap',
  //entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  entities: [User],
  synchronize: false,
  logging: true,
});

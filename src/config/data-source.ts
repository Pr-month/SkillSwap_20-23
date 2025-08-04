import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { dbConfig } from './db.config';

dotenv.config();

export const AppDataSource = new DataSource(dbConfig());
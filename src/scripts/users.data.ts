import { Role } from '../common/types';
import * as dotenv from 'dotenv';

dotenv.config();

export const AdminUsersData = {
  name: String(process.env.SEED_ADMIN_NAME) || 'admin',
  email: String(process.env.SEED_ADMIN_EMAIL) || 'admin@example.com',
  role: Role.ADMIN,
};

export const AdminUsersPassword =
  String(process.env.SEED_ADMIN_PASSWORD) || 'admin123';

export const TestUserPassword = 'testUserPassword123';

export const TestUsersData = [
  {
    name: 'testuser1',
    email: 'test1@example.com',
    role: Role.USER,
  },
  {
    name: 'testuser2',
    email: 'test2@example.com',
    role: Role.USER,
  },
  {
    name: 'testuser3',
    email: 'test3@example.com',
    role: Role.USER,
  },
];

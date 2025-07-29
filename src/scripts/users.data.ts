import { Role } from '../common/types';

export const AdminUsersData = {
  name: 'admin',
  email: 'admin@example.com',
  role: Role.ADMIN,
};

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

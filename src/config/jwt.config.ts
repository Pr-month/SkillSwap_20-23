import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('JWT', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET || 'KRlU9fLKrS9rNmcDkqFibX1c99I',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'test',
  accessExpiration: process.env.JWT_EXPIRATION || '3600s',
  refreshExpiration: process.env.REFRESH_TOKEN_EXPIRATION || '2h',
}));
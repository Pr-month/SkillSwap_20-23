import { ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { AllExceptionFilter } from '../src/common/all-exception.filter';
import { AppDataSource } from '../src/config/data-source';
import { NestExpressApplication } from '@nestjs/platform-express';

export interface User {
  id: number | string;
  email: string;
  name: string;
  gender: string;
  avatar: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: Tokens;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface LogoutResponse {
  message: string;
}

describe('AuthModule (e2e)', () => {
  let app: NestExpressApplication;

  // Use timestamp to avoid conflicts
  const timestamp = Date.now();
  const createUserDto = (suffix: string) => ({
    email: `test-${suffix}-${timestamp}@authExample.com`,
    password: '123456',
    name: 'Test User',
    gender: 'male',
    avatar: 'default-avatar.png',
  });

  const userDto = createUserDto('main');

  beforeAll(async () => {
    await AppDataSource.initialize();
    await AppDataSource.runMigrations();

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication<NestExpressApplication>();
    app.useGlobalFilters(new AllExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await AppDataSource.destroy();
    await app.close();
  });

  describe('Registration', () => {
    it('/auth/register (POST) - должен зарегистрировать пользователя', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userDto)
        .expect(201);

      const response = res.body as AuthResponse;
      if (!response.user || !response.tokens) {
        throw new Error('Unexpected response format');
      }

      expect(response).toHaveProperty('user.id');
      expect(response.user.email).toBe(userDto.email);
      expect(response).toHaveProperty('tokens.accessToken');
      expect(response).toHaveProperty('tokens.refreshToken');
    });

    it('/auth/register (POST) - не должен зарегистрировать того же пользователя повторно', async () => {
      const duplicateUserDto = createUserDto('duplicate');

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(duplicateUserDto)
        .expect(201);

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(duplicateUserDto)
        .expect(409);
    });
  });

  describe('Login', () => {
    it('/auth/login (POST) - должен войти с правильными данными', async () => {
      const loginUserDto = createUserDto('login');

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(loginUserDto)
        .expect(201);

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: loginUserDto.email,
          password: loginUserDto.password,
        })
        .expect(200);

      const response = res.body as AuthResponse;
      expect(response).toHaveProperty('tokens.accessToken');
    });

    it('/auth/login (POST) - не должен войти с неправильным паролем', async () => {
      const wrongPassUserDto = createUserDto('wrongpass');

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(wrongPassUserDto)
        .expect(201);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: wrongPassUserDto.email,
          password: 'wrongpass',
        })
        .expect(401);
    });
  });

  describe('Token operations', () => {
    const tokenUserDto = createUserDto('tokens');

    beforeAll(async () => {
      // Register user for token operations
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(tokenUserDto)
        .expect(201);
    });

    it('/auth/refresh (POST) - должен обновить токены', async () => {
      // Get fresh tokens for this specific test to avoid conflicts
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: tokenUserDto.email,
          password: tokenUserDto.password,
        })
        .expect(200);

      const loginResponse = loginRes.body as AuthResponse;
      const freshRefreshToken = loginResponse.tokens.refreshToken;

      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${freshRefreshToken}`)
        .expect(200);

      const response = res.body as RefreshTokenResponse;
      expect(response).toHaveProperty('accessToken');
      expect(response).toHaveProperty('refreshToken');
    });

    it('/auth/refresh (POST) - должен вернуть 401 при невалидном refresh токене', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', 'Bearer invalid.token')
        .expect(401);
    });

    describe('/auth/logout (POST)', () => {
      it('должен успешно разлогиниться', async () => {
        // Create a separate user for logout test to avoid conflicts
        const logoutUserDto = createUserDto('logout');

        await request(app.getHttpServer())
          .post('/auth/register')
          .send(logoutUserDto)
          .expect(201);

        // Get fresh access token for logout test
        const loginRes = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: logoutUserDto.email,
            password: logoutUserDto.password,
          })
          .expect(200);

        const loginResponse = loginRes.body as AuthResponse;
        const freshAccessToken = loginResponse.tokens.accessToken;

        const res = await request(app.getHttpServer())
          .post('/auth/logout')
          .set('Authorization', `Bearer ${freshAccessToken}`)
          .expect(200);

        const response = res.body as LogoutResponse;
        expect(response.message).toBe('Logged out successfully!');
      });

      it('должен вернуть 401 при невалидном токене', async () => {
        await request(app.getHttpServer())
          .post('/auth/logout')
          .set('Authorization', 'Bearer invalid.token')
          .expect(401);
      });
    });
  });
});

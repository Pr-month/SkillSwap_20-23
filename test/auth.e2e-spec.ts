import { ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { AllExceptionFilter } from '../src/common/all-exception.filter';
import { AppDataSource } from '../src/config/data-source';
import { NestExpressApplication } from '@nestjs/platform-express';

export interface SupertestError {
  status: number;
  body?: any;
  message?: string;
}

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

  const userDto = {
    email: 'test@authExample.com',
    password: '123456',
    name: 'Test User',
    gender: 'male',
    avatar: 'default-avatar.png',
  };

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
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test4@authExample.com',
          password: '123456',
          name: 'Test User',
          gender: 'male',
          avatar: 'default-avatar.png',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test4@authExample.com',
          password: '123456',
          name: 'Test User',
          gender: 'male',
          avatar: 'default-avatar.png',
        })
        .expect(409);
    });
  });

  describe('Login', () => {
    it('/auth/login (POST) - должен войти с правильными данными', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test2@authExample.com',
          password: '123456',
          name: 'Test User',
          gender: 'male',
          avatar: 'default-avatar.png',
        })
        .expect(201);

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test2@authExample.com',
          password: '123456',
        })
        .expect(200);

      const response = res.body as AuthResponse;
      expect(response).toHaveProperty('tokens.accessToken');
    });

    it('/auth/login (POST) - не должен войти с неправильным паролем', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test3@authExample.com',
          password: '123456',
          name: 'Test User',
          gender: 'male',
          avatar: 'default-avatar.png',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test3@authExample.com',
          password: 'wrongpass',
        })
        .expect(401);
    });
  });

  describe('Token operations', () => {
    let refreshToken: string;
    let accessToken: string;

    beforeAll(async () => {
      try {
        await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: 'test5@authExample.com',
            password: '123456',
            name: 'Test User',
            gender: 'male',
            avatar: 'default-avatar.png',
          })
          .expect(201);
      } catch (e: any) {
        if ((e as SupertestError).status !== 409) throw e;
        console.log(e)
      }

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test5@authExample.com',
          password: '123456',
        })
        .expect(200);

      const response = loginRes.body as AuthResponse;
      if (!response.user || !response.tokens) {
        throw new Error('Unexpected response format');
      }
      refreshToken = response.tokens.refreshToken;
      accessToken = response.tokens.accessToken;
    });

    it('/auth/refresh (POST) - должен обновить токены', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${refreshToken}`)
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
        const res = await request(app.getHttpServer())
          .post('/auth/logout')
          .set('Authorization', `Bearer ${accessToken}`)
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

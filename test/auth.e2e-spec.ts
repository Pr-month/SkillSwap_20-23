import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { resetTestDatabase } from './utils/reset-db';

describe('AuthModule (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
    await resetTestDatabase(dataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await dataSource.query('TRUNCATE TABLE "request" CASCADE');
    await dataSource.query(
      'TRUNCATE TABLE "user_favorite_skills_skill" CASCADE',
    );
    await dataSource.query(
      'TRUNCATE TABLE "user_want_to_learn_category" CASCADE',
    );
    await dataSource.query('TRUNCATE TABLE "skill" CASCADE');
    await dataSource.query('TRUNCATE TABLE "category" CASCADE');
    await dataSource.query('TRUNCATE TABLE "user" CASCADE');

    // вариант очистки данных:
    // const entities = dataSource.entityMetadatas;
    // for (const entity of entities) {
    //   await dataSource.query(
    //     `TRUNCATE TABLE "${entity.tableName}" RESTART IDENTITY CASCADE;`,
    //   );
    // }
  });

  it('/auth/register (POST) - должен зарегистрировать пользователя', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: '123456',
        name: 'Test User',
        gender: 'male',
        avatar: 'default-avatar.png',
      })
      .expect(201);

    expect(res.body).toHaveProperty('user.id');
    expect(res.body.user.email).toBe('test@example.com');
  });

  it('/auth/register (POST) - не должен зарегистрировать того же пользователя повторно', async () => {
    // Регистрируем один раз
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test4@example.com',
        password: '123456',
        name: 'Test User',
        gender: 'male',
        avatar: 'default-avatar.png',
      })
      .expect(201);

    // Пробуем зарегистрировать с тем же email — ожидаем 400
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test4@example.com',
        password: '123456',
        name: 'Test User',
        gender: 'male',
        avatar: 'default-avatar.png',
      })
      .expect(400);
  });

  it('/auth/login (POST) - должен войти с правильными данными', async () => {
    // Сначала регистрируем
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test2@example.com',
        password: '123456',
        name: 'Test User',
        gender: 'male',
        avatar: 'default-avatar.png',
      })
      .expect(201);

    // Логинимся
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test2@example.com',
        password: '123456',
      })
      .expect(200);

    expect(res.body).toHaveProperty('tokens.accessToken');
  });

  it('/auth/login (POST) - не должен войти с неправильным паролем', async () => {
    // Сначала регистрируем
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test3@example.com',
        password: '123456',
        name: 'Test User',
        gender: 'male',
        avatar: 'default-avatar.png',
      })
      .expect(201);

    // Логинимся с неверным паролем
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test3@example.com',
        password: 'wrongpass',
      })
      .expect(401);
  });
});

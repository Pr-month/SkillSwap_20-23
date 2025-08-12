/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { TestUsersData } from '../src/scripts/users.data';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  let someID: string;
  let someName: string;
  let someEmail: string;
  let someUser: object;
  let jwtToken: string;
  const oldPassword = 'test123';

  it('GET /users/ should return a list of users.', async () => {
    const response = await request(app.getHttpServer())
      .get('/users/')
      .expect(200);
    expect(response.body.data).toEqual(
      expect.arrayContaining([expect.objectContaining(TestUsersData[0])]),
    );
    someID = response.body.data[0].id;
    someName = response.body.data[0].name;
    someEmail = response.body.data[0].email;
    someUser = { name: someName, email: someEmail, role: 'user' };
    expect(TestUsersData).toEqual(
      expect.arrayContaining([expect.objectContaining(someUser)]),
    );
  });

  it('GET /users/:id should return a user.', async () => {
    const response = await request(app.getHttpServer())
      .get(`/users/${someID}`)
      .expect(200);
    expect(response.body).toEqual(expect.objectContaining(someUser));
  });

  it('GET /users/me should return the current user.', async () => {
    const authResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: someEmail, password: oldPassword });
    const authUser = authResponse.body.user;
    expect(authUser).toEqual(expect.objectContaining(someUser));
    jwtToken = authResponse.body.tokens.accessToken;

    const response = await request(app.getHttpServer())
      .get(`/users/${someID}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);
    expect(response.body).toEqual(expect.objectContaining(someUser));
  });

  it('PATCH /users/me should change user data of a current user.', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/users/me`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ about: 'Testing patching about data for this user' })
      .expect(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        about: 'Testing patching about data for this user',
        ...someUser,
      }),
    );
  });

  it('PATCH /users/me/password should change the password of a current user.', async () => {
    // create new password
    const newPassword = 'testingPasswordChange';
    await request(app.getHttpServer())
      .patch(`/users/me/password`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ currentPassword: oldPassword, newPassword: newPassword })
      .expect(204);

    // test new password
    const authResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: someEmail, password: newPassword })
      .expect(200);
    const authUser = authResponse.body.user;
    expect(authUser).toEqual(expect.objectContaining(someUser));
    jwtToken = authResponse.body.tokens.accessToken;
  });
  /*
  it('GET /users/by-skill/:id should return a user.', async () => {
    const categoriesResponse = await request(app.getHttpServer())
      .get('/categories')
      .expect(200);
    const someCategoryID = categoriesResponse.body[0].id;
    const skillResponse = await request(app.getHttpServer())
      .post(`/skills`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        title: 'New Skill',
        description: 'New Skill Description',
        categoryId: someCategoryID,
      })
      .expect(201);
    expect(skillResponse.body).toEqual(
      expect.objectContaining({
        title: 'New Skill',
        description: 'New Skill Description',
      }),
    );
    const someSkillID = skillResponse.body.id;
    const response = await request(app.getHttpServer())
      .get(`/users/by-skill/${someSkillID}`)
      .expect(200);
    expect(response).toEqual(expect.objectContaining(someUser));
  });
  */

  afterAll(async () => {
    await app.close();
  });
});

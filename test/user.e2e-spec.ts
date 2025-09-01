import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { TestUserPassword, TestUsersData } from '../src/scripts/users.data';
import { AllExceptionFilter } from '../src/common/all-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppDataSource } from '../src/config/data-source';
import { Repository } from 'typeorm';
import { User } from '../src/users/entities/user.entity';
import { Category } from '../src/categories/entities/category.entity';
import { Role } from '../src/common/types';
import { Skill } from '../src/skills/entities/skill.entity';

// Making DTOs
export interface SomeUserDTO {
  email: string;
  name: string;
  role: Role;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  body: {
    user: User;
    tokens: Tokens;
  };
}

export interface CategoriesResponse {
  body: Category[];
}

export interface SkillResponse {
  body: Skill;
}

export interface FindAllUsersResponse {
  body: { data: User[]; page: number; totalPages: number };
}

export interface SimilarSkillResponse {
  body: User[];
}

describe('User module (e2e)', () => {
  let app: INestApplication<App>;

  let userRepo: Repository<User>;
  let categoryRepo: Repository<Category>;
  let skillRepo: Repository<Skill>;

  let userPassword: string;
  let someUserEntity: User;
  let someID: string;
  let someEmail: string;
  let someUser: SomeUserDTO;
  let someSkillID: string;
  let someSkillEntity: Skill;
  let someCategoryID: string;
  let jwtToken: string;
  const forgedJwtToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMzM3IiwiZW1haWwiOiJOaWNrU3RlYWxzQGludEJhZC5keSIsInJvbGUiOiJhZG1pbiJ9.h4hviYe0jmfkgWoakFmnJnQKo85x-oZMNZu5-b4c_0g';

  beforeAll(async () => {
    await AppDataSource.initialize();
    await AppDataSource.runMigrations();

    const moduleRef: TestingModule = await Test.createTestingModule({
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

    userRepo = AppDataSource.getRepository(User);
    categoryRepo = AppDataSource.getRepository(Category);
    skillRepo = AppDataSource.getRepository(Skill);
  });

  afterAll(async () => {
    await AppDataSource.destroy();
    await app.close();
  });

  it('Repositories should be seeded. Populating necessary data', async () => {
    const testAllSkills = await skillRepo.find();
    expect(testAllSkills.length).toBeGreaterThanOrEqual(1);
    const testAllUsers = await userRepo.find();
    expect(testAllUsers.length).toBeGreaterThanOrEqual(1);
    const testAllCategories = await categoryRepo.find();
    expect(testAllCategories.length).toBeGreaterThanOrEqual(1);

    const existingSkills = await skillRepo.find({ relations: ['category'] });
    const someExistingSkill = existingSkills[0];
    someCategoryID = someExistingSkill.category.id;

    // Creating some user for tests
    someUser = {
      name: 'Tests Users',
      email: 'testsUsers@usersExample.com',
      role: Role.USER,
    };
    userPassword = TestUserPassword;
    someEmail = someUser.email;
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: someUser.email,
        password: userPassword,
        name: someUser.name,
        gender: 'male',
        avatar: 'default-avatar.png',
      })
      .expect(201);
    someUserEntity = await userRepo.findOneOrFail({
      where: {
        email: someEmail,
      },
    });
    someID = someUserEntity.id;

    const authResponse: AuthResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: someEmail, password: userPassword });
    const authUser = authResponse.body.user;
    expect(authUser).toEqual(expect.objectContaining(someUser));
    jwtToken = authResponse.body.tokens.accessToken;

    // creating some skills for tests
    const skillResponse: SkillResponse = await request(app.getHttpServer())
      .post(`/skills`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        title: 'New Skill',
        description: 'New Skill Description',
        categoryId: someCategoryID,
        images: ['shouldNotBeHere.jpg'],
      })
      .expect(201);
    expect(skillResponse.body).toEqual(
      expect.objectContaining({
        title: 'New Skill',
        description: 'New Skill Description',
      }),
    );
    someSkillID = skillResponse.body.id;
    someSkillEntity = await skillRepo.findOneOrFail({
      where: {
        id: someSkillID,
      },
    });
  });

  it('GET /users/ should return a list of users.', async () => {
    const response: FindAllUsersResponse = await request(app.getHttpServer())
      .get('/users/')
      .expect(200);
    expect(response.body.data).toEqual(
      expect.arrayContaining([expect.objectContaining(TestUsersData[0])]),
    );
  });

  it('GET /users/ should have a page and total pages returned .', async () => {
    const response: FindAllUsersResponse = await request(app.getHttpServer())
      .get('/users/')
      .expect(200);
    expect(response.body.page).toBeGreaterThanOrEqual(1);
    expect(response.body.totalPages).toBeGreaterThanOrEqual(1);
  });

  it('GET /users/:id should return a user.', async () => {
    const response = await request(app.getHttpServer())
      .get(`/users/${someID}`)
      .expect(200);
    expect(response.body).toEqual(expect.objectContaining(someUser));
  });

  it('GET /users/:id should not return a user with password.', async () => {
    const response = await request(app.getHttpServer())
      .get(`/users/${someID}`)
      .expect(200);
    expect(response.body).toEqual(expect.objectContaining(someUser));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(response.body.password).toBeUndefined();
  });

  it('GET /users/:id should not return a user by a wrong id.', async () => {
    await request(app.getHttpServer())
      .get(`/users/12345678-1234-1234-1234-012345678910`)
      .expect(400);
  });

  it('GET /users/:id should throw 500 when ID is not a valid UUID.', async () => {
    await request(app.getHttpServer()).get(`/users/notArealID`).expect(500);
  });

  it('GET /users/me should return the current user.', async () => {
    const response = await request(app.getHttpServer())
      .get(`/users/me`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);
    expect(response.body).toEqual(expect.objectContaining(someUser));
  });

  it('GET /users/me should not return the current user with a fake jwt token.', async () => {
    await request(app.getHttpServer())
      .get(`/users/me`)
      .set('Authorization', `Bearer ${forgedJwtToken}`)
      .expect(401);
  });

  it('GET /users/me should not return the current user without a jwt token.', async () => {
    await request(app.getHttpServer()).get(`/users/me`).expect(401);
  });

  it('PATCH /users/me should change user data of a current user.', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/users/me`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        about: 'Testing patching about data for this user',
        wantToLearn: [someCategoryID],
      })
      .expect(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        about: 'Testing patching about data for this user',
        id: someID,
      }),
    );
  });

  it('PATCH /users/me should not change user password of a current user.', async () => {
    await request(app.getHttpServer())
      .patch(`/users/me`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ password: 'Got you!' })
      .expect(400);
  });

  it('PATCH /users/me should not change user data without jwtToken.', async () => {
    await request(app.getHttpServer())
      .patch(`/users/me`)
      .send({ about: 'Testing patching about data for this user' })
      .expect(401);
  });

  it('PATCH /users/me/password should not change the password of a current user if the password is the same.', async () => {
    await request(app.getHttpServer())
      .patch(`/users/me/password`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ currentPassword: userPassword, newPassword: userPassword })
      .expect(409);
  });

  it('PATCH /users/me/password should not change the password of a current user if the password is too short.', async () => {
    const shortPassword = 'short';
    await request(app.getHttpServer())
      .patch(`/users/me/password`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ currentPassword: userPassword, newPassword: shortPassword })
      .expect(400);
  });

  it('PATCH /users/me/password should not change the password of a current user if the current password is wrong.', async () => {
    const wrongCurrentPassword = 'thisIsNotTheCorrectCurrentPassword';
    const newPassword = 'newPassword';
    await request(app.getHttpServer())
      .patch(`/users/me/password`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ currentPassword: wrongCurrentPassword, newPassword: newPassword })
      .expect(401);
  });

  it('PATCH /users/me/password should not change the password of a current user if the jwt token is missing.', async () => {
    const newPassword = 'newPassword';
    await request(app.getHttpServer())
      .patch(`/users/me/password`)
      .send({ currentPassword: userPassword, newPassword: newPassword })
      .expect(401);
  });

  it('PATCH /users/me/password should not change the password of a current user if the jwt token is forged.', async () => {
    const newPassword = 'newPassword';
    await request(app.getHttpServer())
      .patch(`/users/me/password`)
      .set('Authorization', `Bearer ${forgedJwtToken}`)
      .send({ currentPassword: userPassword, newPassword: newPassword })
      .expect(401);
  });

  it('PATCH /users/me/password should change the password of a current user.', async () => {
    // create new password
    const newPassword = 'newPassword';
    await request(app.getHttpServer())
      .patch(`/users/me/password`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ currentPassword: userPassword, newPassword: newPassword })
      .expect(204);

    // test new password
    const authResponse: AuthResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: someEmail, password: newPassword })
      .expect(200);
    const authUser = authResponse.body.user;
    expect(authUser).toEqual(expect.objectContaining(someUser));
    jwtToken = authResponse.body.tokens.accessToken;
  });

  it('GET /users/by-skill/:id should return a user.', async () => {
    const response = await request(app.getHttpServer())
      .get(`/users/by-skill/${someSkillID}`)
      .expect(200);
    expect(response.body).toEqual(expect.objectContaining(someUser));
  });

  it('GET users/similar-skill/:id should return a list of users with similar skills.', async () => {
    const similarSkillResponse: SimilarSkillResponse = await request(
      app.getHttpServer(),
    )
      .get(`/users/similar-skill/${someSkillID}`)
      .expect(200);
    expect(similarSkillResponse.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: someUser.name, email: someUser.email }),
      ]),
    );
  });

  it('Post test cleanup', async () => {
    await userRepo.remove(someUserEntity);
    await skillRepo.remove(someSkillEntity);
  });

  afterAll(async () => {
    await app.close();
  });
});

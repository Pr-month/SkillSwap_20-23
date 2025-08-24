import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import {
  AdminUsersData,
  AdminUsersPassword,
  TestUserPassword,
  TestUsersData,
} from '../src/scripts/users.data';
import { AllExceptionFilter } from '../src/common/all-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppDataSource } from '../src/config/data-source';
import { Repository } from 'typeorm';
import { User } from '../src/users/entities/user.entity';
import { Category } from '../src/categories/entities/category.entity';
import { Role } from '../src/common/types';
import { Categories } from '../src/scripts/categories.data';
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

  let testUsers: User[];
  let userPassword: string;
  let someID: string;
  let someName: string;
  let someEmail: string;
  let someUser: SomeUserDTO;
  let someSkillID: string;
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

    try {
      const existingAdmin = await userRepo.findOne({
        where: { email: AdminUsersData.email, role: Role.ADMIN },
      });
      if (existingAdmin && existingAdmin.email === AdminUsersData.email) {
        console.log('Администратор уже существует');
        return;
      }

      const admin = await userRepo.save(
        userRepo.create({
          ...AdminUsersData,
          password: await bcrypt.hash(AdminUsersPassword, 10),
        }),
      );

      await userRepo.save(admin);

      // проверяем, есть ли уже данные в таблице
      const existing = await categoryRepo.count();
      if (existing > 0) {
        await AppDataSource.destroy();
        return;
      }

      await Promise.all(
        Categories.map(async (categoryData) => {
          const parentCategory = await categoryRepo.save(
            categoryRepo.create({ name: categoryData.name }),
          );

          await Promise.all(
            categoryData.children.map((childName) =>
              categoryRepo.save(
                categoryRepo.create({
                  name: childName,
                  parent: parentCategory,
                }),
              ),
            ),
          );
        }),
      );

      const createdCategories = await categoryRepo.find();
      const someCategory = createdCategories[0];
      someCategoryID = createdCategories[0].id;

      userPassword = TestUserPassword;
      const userPasswordEncrypted = await bcrypt.hash(userPassword, 10);

      for (const user of TestUsersData) {
        const thisUser = await userRepo.findOne({
          where: { email: user.email },
        });

        if (thisUser && thisUser.email === user.email) {
          console.log(`Пользователь уже существует! ${thisUser.email}`);
          return;
        }

        await userRepo.save(
          userRepo.create({
            ...user,
            password: userPasswordEncrypted,
            wantToLearn: [someCategory],
          }),
        );
      }

      //Creating skills to every user
      testUsers = await userRepo.findBy({
        role: Role.USER,
      });
      for (const user of testUsers) {
        await skillRepo.save(
          skillRepo.create({
            title: `${user.name} skill.`,
            description: `${user.name} skill is ${user.name}'s best skill!`,
            images: ['images.jpg'],
            owner: user,
            category: someCategory,
          }),
        );
      }
      testUsers = await userRepo.findBy({
        role: Role.USER,
        wantToLearn: someCategory,
      });

      console.log('Тестовая БД успешна заполнена необходимыми значениями.');
    } catch (error) {
      console.error('Ошибка при подготовке к тестам:', error);
    }
  });

  afterAll(async () => {
    await AppDataSource.destroy();
    await app.close();
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

  it('GET /users/ populates data for following tests.', async () => {
    const response: FindAllUsersResponse = await request(app.getHttpServer())
      .get('/users/')
      .expect(200);
    expect(response.body.data).toEqual(
      expect.arrayContaining([expect.objectContaining(TestUsersData[0])]),
    );
    let i = 0;
    if (response.body.data[i].role === Role.ADMIN) {
      i++;
    }
    someID = response.body.data[i].id;
    someName = response.body.data[i].name;
    someEmail = response.body.data[i].email;
    someUser = { name: someName, email: someEmail, role: Role.USER };

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
    const authResponse: AuthResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: someEmail, password: userPassword });
    const authUser = authResponse.body.user;
    expect(authUser).toEqual(expect.objectContaining(someUser));
    jwtToken = authResponse.body.tokens.accessToken;

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
      .send({ about: 'Testing patching about data for this user' })
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
    testUsers.forEach((user) => {
      if (user.name != someUser.name) {
        expect(similarSkillResponse.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ name: user.name, email: user.email }),
          ]),
        );
      }
    });
  });

  afterAll(async () => {
    await app.close();
  });
});

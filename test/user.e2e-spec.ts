import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import {
  AdminUsersData,
  AdminUsersPassword,
  TestUsersData,
} from '../src/scripts/users.data';
import { AllExceptionFilter } from '../src/common/all-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppDataSource } from '../src/config/data-source';
import { ObjectLiteral, Repository } from 'typeorm';
import { User } from '../src/users/entities/user.entity';
// import { Skill } from '../src/skills/entities/skill.entity';
import { Category } from '../src/categories/entities/category.entity';
import { Role } from '../src/common/types';
import { Categories } from '../src/scripts/categories.data';
import { Skill } from 'src/skills/entities/skill.entity';

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

describe('User module (e2e)', () => {
  let app: INestApplication<App>;
  let userRepo: Repository<ObjectLiteral>;
  let categoryRepo: Repository<ObjectLiteral>;
  let userPassword: string;
  let someID: string;
  let someName: string;
  let someEmail: string;
  let someUser: SomeUserDTO;
  let jwtToken: string;

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
        whitelist: false,
        forbidNonWhitelisted: false,
        transform: false,
      }),
    );
    await app.init();
    userRepo = AppDataSource.getRepository(User);
    categoryRepo = AppDataSource.getRepository(Category);

    try {
      const existingAdmin = await userRepo.findOne({
        where: { email: AdminUsersData.email, role: Role.ADMIN },
      });
      if (existingAdmin && existingAdmin.email === AdminUsersData.email) {
        console.log('Администратор уже существует');
        return;
      }

      const user = await userRepo.save(
        userRepo.create({
          ...AdminUsersData,
          password: await bcrypt.hash(AdminUsersPassword, 10),
        }),
      );

      await userRepo.save(user);
      userPassword = 'userPassword123';
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
          }),
        );
      }

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

  it('GET /users/me should return the current user.', async () => {
    const authResponse: AuthResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: someEmail, password: userPassword });
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
        id: someID,
      }),
    );
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
    const categoriesResponse: CategoriesResponse = await request(
      app.getHttpServer(),
    )
      .get('/categories')
      .expect(200);
    const someCategoryID = categoriesResponse.body[0].id;
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
    const someSkillID = skillResponse.body.id;
    const response = await request(app.getHttpServer())
      .get(`/users/by-skill/${someSkillID}`)
      .expect(200);
    expect(response.body).toEqual(expect.objectContaining(someUser));
  });

  afterAll(async () => {
    await app.close();
  });
});

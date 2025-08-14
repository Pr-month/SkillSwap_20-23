import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { AllExceptionFilter } from '../src/common/all-exception.filter';
import { AppDataSource } from '../src/config/data-source';
import { NestExpressApplication } from '@nestjs/platform-express';
import { CreateCategoryDto } from '../src/categories/dto/create-category.dto';
import { Category } from '../src/categories/entities/category.entity';
import { UpdateCategoryDto } from '../src/categories/dto/update-category.dto';
import { User } from '../src/users/entities/user.entity';
import { Skill } from '../src/skills/entities/skill.entity';
import { App } from 'supertest/types';
import { Repository } from 'typeorm';
import { AdminUsersData, AdminUsersPassword, TestUsersData } from '../src/scripts/users.data';
import { Role } from '../src/common/types';
import { Categories } from '../src/scripts/categories.data';
import * as bcrypt from 'bcrypt';

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

describe('Categories (e2e)', () => {
  let app: INestApplication<App>;

  let userRepo: Repository<User>;
  let categoryRepo: Repository<Category>;

  let testUsers: User[];
  let userPassword: string;
  let someID: string;
  let someName: string;
  let someEmail: string;
  let someUser: SomeUserDTO;
  let jwtToken: string;
  const forgedJwtToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMzM3IiwiZW1haWwiOiJOaWNrU3RlYWxzQGludEJhZC5keSIsInJvbGUiOiJhZG1pbiJ9.h4hviYe0jmfkgWoakFmnJnQKo85x-oZMNZu5-b4c_0g';

  let createdCategoryId: string;
  let someCategoryID: string;

  const categoriesDtoNotParentID: CreateCategoryDto = {
    name: 'Categories # 1',
  };

  const categoriesDtoWithParent: CreateCategoryDto = {
    name: 'Categories # 2',
    parentId: 'testParentId',
  };

  const updateCategoryDto: UpdateCategoryDto = {
    name: 'Updated Category Name',
  };

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

    try {
      const existingAdmin = await userRepo.findOne({
        where: { email: AdminUsersData.email, role: Role.ADMIN },
      });
      if (existingAdmin && existingAdmin.email === AdminUsersData.email) {
        console.log('Администратор уже существует');
        return;
      }

      userPassword = 'userPassword123';
      const userPasswordEncrypted = await bcrypt.hash(userPassword, 10);

      const admin = await userRepo.save(
        userRepo.create({
          ...AdminUsersData,
          password: userPasswordEncrypted,
        }),
      );

      someName = admin.name;
      someEmail = admin.email;
      someUser = { name: someName, email: someEmail, role: Role.USER };

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
      someCategoryID = createdCategories[0].id;

      console.log('Тестовая БД успешна заполнена необходимыми значениями.');
    } catch (error) {
      console.error('Ошибка при подготовке к тестам:', error);
    }
  });

  afterAll(async () => {
    await AppDataSource.destroy();
    await app.close();
  });

  describe('GET', () => {
    it('/categories - Получение всех категорий', async () => {
      const res = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);

      expect(res.body).toBeInstanceOf(Array);
      expect(res.body).toHaveLength(8);
    });
  });

  describe('POST', () => {
    it('/categories - Создание новой категории без parentId', async () => {

      const authResponse: AuthResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: someEmail, password: userPassword });
      const authUser = authResponse.body.user;
      expect(authUser).toEqual(expect.objectContaining(someUser));
      jwtToken = authResponse.body.tokens.accessToken;

      const res = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(categoriesDtoNotParentID)
        .expect(201);

      const response = res.body as Category;
      createdCategoryId = response.id;

      expect(response).toHaveProperty('id');
      expect(response.name).toBe(categoriesDtoNotParentID.name);
    });

    it('/categories - Создание категории с parentId', async () => {
      const res = await request(app.getHttpServer())
        .post('/categories')
        .send(categoriesDtoWithParent)
        .expect(201);

      const response = res.body as Category;
      expect(response).toHaveProperty('id');
      expect(response.name).toBe(categoriesDtoWithParent.name);
      expect(response.parent?.id).toBe(categoriesDtoWithParent.parentId);
    });
  });

  // describe('PATCH', () => {
  //   it('/categories/:id - Обновление существующей категории', async () => {
  //     const res = await request(app.getHttpServer())
  //       .patch(`/categories/${createdCategoryId}`)
  //       .send(updateCategoryDto)
  //       .expect(200);

  //     const response = res.body as Category;
  //     expect(response.name).toBe(updateCategoryDto.name);
  //   });
  // });

  // describe('DELETE', () => {
  //   it('/categories/:id - Удаление существующей категории', async () => {
  //     const res = await request(app.getHttpServer())
  //       .delete(`/categories/${createdCategoryId}`)
  //       .expect(204);

  //     const checkRes = await request(app.getHttpServer())
  //       .get(`/categories/${createdCategoryId}`)
  //       .expect(404);
  //   });
  // });

  // describe('Validation', () => {
  //   it('Должен возвращать 400 при отсутствии имени категории', async () => {
  //     const invalidDto: Partial<CreateCategoryDto> = {};

  //     const res = await request(app.getHttpServer())
  //       .post('/categories')
  //       .send(invalidDto)
  //       .expect(400);

  //     expect(res.body).toHaveProperty('message');
  //   });

  //   it('Должен возвращать 400 при слишком длинном имени категории', async () => {
  //     const longName = 'a'.repeat(101); // Длина превышает максимально допустимую
  //     const invalidDto: CreateCategoryDto = {
  //       name: longName,
  //     };

  //     const res = await request(app.getHttpServer())
  //       .post('/categories')
  //       .send(invalidDto)
  //       .expect(400);

  //     expect(res.body).toHaveProperty('message');
  //   });

  //   it('Должен возвращать 400 при создании категории с несуществующим parentId', async () => {
  //     const invalidDto: CreateCategoryDto = {
  //       name: 'Test Category',
  //       parentId: 'nonexistentId',
  //     };

  //     const res = await request(app.getHttpServer())
  //       .post('/categories')
  //       .send(invalidDto)
  //       .expect(400);

  //     expect(res.body).toHaveProperty('message');
  //   });

  //   it('Должен возвращать 400 при обновлении категории с пустым именем', async () => {
  //     const invalidUpdateDto: Partial<UpdateCategoryDto> = {
  //       name: '',
  //     };

  //     const res = await request(app.getHttpServer())
  //       .patch(`/categories/${createdCategoryId}`)
  //       .send(invalidUpdateDto)
  //       .expect(400);

  //     expect(res.body).toHaveProperty('message');
  //   });

  //   it('Должен возвращать 400 при обновлении категории с некорректным parentId', async () => {
  //     const invalidUpdateDto: UpdateCategoryDto = {
  //       parentId: 'invalidParentId',
  //     };

  //     const res = await request(app.getHttpServer())
  //       .patch(`/categories/${createdCategoryId}`)
  //       .send(invalidUpdateDto)
  //       .expect(400);

  //     expect(res.body).toHaveProperty('message');
  //   });
  // });

  // describe('Uniqueness', () => {
  //   it('Должен возвращать 409 при попытке создать категорию с тем же именем под тем же родителем', async () => {
  //     const res = await request(app.getHttpServer())
  //       .post('/categories')
  //       .send(categoriesDtoNotParentID)
  //       .expect(409);

  //     expect(res.body).toHaveProperty('message');
  //   });
  // });
});
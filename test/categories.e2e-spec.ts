import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
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
import { AdminUsersData, AdminUsersPassword } from '../src/scripts/users.data';
import { Role } from '../src/common/types';

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

  let categoryRepo: Repository<Category>;

  let userPassword: string;
  let someEmail: string;
  let jwtToken: string;

  let createdCategoryId: string;

  // Use timestamp to avoid conflicts with existing data
  const timestamp = Date.now();
  const categoriesDtoNotParentID: CreateCategoryDto = {
    name: `Test Category ${timestamp}`,
  };

  const categoriesDtoWithParent: CreateCategoryDto = {
    name: `Test Child Category ${timestamp}`,
    parentId: 'testParentId',
  };

  const updateCategoryDto: UpdateCategoryDto = {
    name: `Updated Test Category ${timestamp}`,
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
    categoryRepo = AppDataSource.getRepository(Category);

    try {
      // Используем уже существующего администратора из сидинга
      someEmail = AdminUsersData.email;
      userPassword = AdminUsersPassword;

      // Авторизация для всех тестов
      const authResponse: AuthResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: someEmail, password: userPassword });
      jwtToken = authResponse.body.tokens.accessToken;

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
      const categories = await categoryRepo.find();

      let parentCategory: Category | undefined;
      if (categories.length > 0) {
        parentCategory = categories[0];
        categoriesDtoWithParent.parentId = parentCategory.id;
      } else {
        throw new Error('No categories found to use as parent');
      }

      const res = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(categoriesDtoWithParent)
        .expect(201);

      const response = res.body as Category;

      expect(response).toHaveProperty('id');
      expect(response.name).toBe(categoriesDtoWithParent.name);
      expect(response.parent!.id).toBe(parentCategory.id);
    });
  });

  describe('PATCH', () => {
    it('/categories/:id - Обновление существующей категории', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/categories/${createdCategoryId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(updateCategoryDto)
        .expect(200);

      const response = res.body as Category;
      expect(response.name).toBe(updateCategoryDto.name);
    });
  });

  describe('DELETE', () => {
    it('/categories/:id - Удаление существующей категории', async () => {
      if (!createdCategoryId) {
        throw new Error('Нет созданной категории для удаления');
      }

      const categoryId = createdCategoryId;

      try {
        await request(app.getHttpServer())
          .delete(`/categories/${categoryId}`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);

        const deletedCategory = await categoryRepo.find({
          where: {
            id: categoryId,
          },
        });
        expect(deletedCategory).toStrictEqual([]);

        const allCategories = await request(app.getHttpServer())
          .get('/categories')
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const categoryExists = allCategories.body.some(
          (category: Category) => category.id === categoryId,
        );
        expect(categoryExists).toBe(false);
      } catch (error) {
        console.error('Ошибка при удалении категории:', error);
        throw error;
      }
    });

    it('/categories/:id - Попытка удаления несуществующей категории', async () => {
      await request(app.getHttpServer())
        .delete(`/categories/224e4566-62d2-4c07-8c08-98dd966c0d15`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(404);
    });
  });

  describe('Validation', () => {
    it('Должен возвращать 400 при отсутствии имени категории', async () => {
      const invalidDto: Partial<CreateCategoryDto> = {};

      const res = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(invalidDto)
        .expect(400);

      expect(res.body).toHaveProperty('message');
    });

    it('Должен возвращать 400 при слишком длинном имени категории', async () => {
      const longName = 'a'.repeat(101);
      const invalidDto: CreateCategoryDto = {
        name: longName,
      };

      const res = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(invalidDto)
        .expect(400);

      expect(res.body).toHaveProperty('message');
    });

    it('Должен возвращать 400 при создании категории с несуществующим parentId', async () => {
      const invalidDto: CreateCategoryDto = {
        name: 'Test Category',
        parentId: 'nonexistentId',
      };

      const res = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(invalidDto)
        .expect(400);

      expect(res.body).toHaveProperty('message');
    });

    it('Должен возвращать 400 при обновлении категории с пустым именем', async () => {
      const invalidUpdateDto: Partial<UpdateCategoryDto> = {
        name: '',
      };

      const res = await request(app.getHttpServer())
        .patch(`/categories/${createdCategoryId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(invalidUpdateDto)
        .expect(400);

      expect(res.body).toHaveProperty('message');
    });

    it('Должен возвращать 400 при обновлении категории с некорректным parentId', async () => {
      const invalidUpdateDto: UpdateCategoryDto = {
        parentId: 'invalidParentId',
      };

      const res = await request(app.getHttpServer())
        .patch(`/categories/${createdCategoryId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(invalidUpdateDto)
        .expect(400);

      expect(res.body).toHaveProperty('message');
    });
  });
});

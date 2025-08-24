import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { TestUsersData } from '../src/scripts/users.data';
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
    // await seedForTests(userRepo, skillRepo, categoryRepo);
  });

  afterAll(async () => {
    await AppDataSource.destroy();
    await app.close();
  });

  it('User Repo should contatin seeded data', async () => {
    const users = await userRepo.find();
    expect(users.length).toBeGreaterThan(1);
  });

  it('Categories Repo should contatin seeded data', async () => {
    const categories = await categoryRepo.find();
    expect(categories.length).toBeGreaterThan(1);
  });

  it('Skills Repo should contatin seeded data', async () => {
    const skills = await skillRepo.find();
    expect(skills.length).toBeGreaterThan(1);
  });

  it('GET /users/ should return a list of users.', async () => {
    const response: FindAllUsersResponse = await request(app.getHttpServer())
      .get('/users/')
      .expect(200);
    expect(response.body.data).toEqual(
      expect.arrayContaining([expect.objectContaining(TestUsersData[0])]),
    );
  });

  it('GET /users/ should return have a page and total pages returned .', async () => {
    const response: FindAllUsersResponse = await request(app.getHttpServer())
      .get('/users/')
      .expect(200);
    expect(response.body.page).toBeGreaterThanOrEqual(1);
    expect(response.body.totalPages).toBeGreaterThanOrEqual(1);
  });

  afterAll(async () => {
    await app.close();
  });
});

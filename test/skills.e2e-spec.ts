import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { AllExceptionFilter } from '../src/common/all-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppDataSource } from '../src/config/data-source';
import { Repository } from 'typeorm';
import { User } from '../src/users/entities/user.entity';
import { Category } from '../src/categories/entities/category.entity';
import { Skill } from '../src/skills/entities/skill.entity';
import { TestSkills } from '../src/scripts/skills-test.data';

export interface FindAllSkillsResponse {
  body: { data: User[]; page: number; totalPages: number };
}

describe('Skills module (e2e)', () => {
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
  });

  afterAll(async () => {
    await AppDataSource.destroy();
    await app.close();
  });

  it('GET /skills/ should return a list of skills.', async () => {
    const response: FindAllSkillsResponse = await request(app.getHttpServer())
      .get('/skills/')
      .expect(200);
    expect(response.body.data).toEqual(
      expect.arrayContaining([expect.objectContaining(TestSkills[0])]),
    );
  });

  it('GET /skills/ should have a page and total pages returned .', async () => {
    const response: FindAllSkillsResponse = await request(app.getHttpServer())
      .get('/skills/')
      .expect(200);
    expect(response.body.page).toBeGreaterThanOrEqual(1);
    expect(response.body.totalPages).toBeGreaterThanOrEqual(1);
  });

  afterAll(async () => {
    await app.close();
  });
});

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
  body: { data: User[]; page: number; totalPage: number };
}

export interface GetSkillIdResponse {
  body: Skill;
}

describe('Skills module (e2e)', () => {
  let app: INestApplication<App>;

  let userRepo: Repository<User>;
  let categoryRepo: Repository<Category>;
  let skillRepo: Repository<Skill>;

  let testSkills: Skill[];
  let someTestSkill: Skill;

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

  it('Skill repository should not be empty, then getting data for the next tests.', async () => {
    testSkills = await skillRepo.find();
    expect(testSkills.length).toBeGreaterThanOrEqual(1);
    someTestSkill = testSkills[0];
  });

  it('GET /skills/ should return a list of skills.', async () => {
    const response: FindAllSkillsResponse = await request(app.getHttpServer())
      .get('/skills/')
      .expect(200);
    expect(response.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: TestSkills[0].title }),
      ]),
    );
  });

  it('GET /skills/ should have a page and total pages returned .', async () => {
    const response: FindAllSkillsResponse = await request(app.getHttpServer())
      .get('/skills/')
      .expect(200);
    expect(response.body.page).toBeGreaterThanOrEqual(1);
    expect(response.body.totalPage).toBeGreaterThanOrEqual(1);
  });

  it('GET /skills/ should not return a list of skills owner with password and refreshToken.', async () => {
    const response: FindAllSkillsResponse = await request(app.getHttpServer())
      .get('/skills/')
      .expect(200);
    expect(response.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: TestSkills[0].title }),
      ]),
    );
    expect(response.body.data[0].password).toBeUndefined();
    expect(response.body.data[0].refreshToken).toBeUndefined();
  });

  it('GET /skills/:id should return a skill.', async () => {
    const response: GetSkillIdResponse = await request(app.getHttpServer())
      .get(`/skills/${someTestSkill.id}`)
      .expect(200);
    expect(response.body).toEqual(
      expect.objectContaining({ title: someTestSkill.title }),
    );
  });

  it('GET /skills/:id should not return a skill owner with password and refreshToken.', async () => {
    const response: GetSkillIdResponse = await request(app.getHttpServer())
      .get(`/skills/${someTestSkill.id}`)
      .expect(200);
    expect(response.body.owner).toBeUndefined();
    expect(response.body.owner.password).toBeUndefined();
    expect(response.body.owner.refreshToken).toBeUndefined();
  });

  afterAll(async () => {
    await app.close();
  });
});

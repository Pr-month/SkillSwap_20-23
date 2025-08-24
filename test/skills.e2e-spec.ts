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
import { TestUserPassword } from '../src/scripts/users.data';
import { CreateSkillDto } from '../src/skills/dto/create-skill.dto';
import { Gender } from '../src/common/gender.enum';
import { RegisterDto } from '../src/auth/dto/register.dto';
import { UpdateSkillDto } from 'src/skills/dto/update-skill.dto';

export interface FindAllSkillsResponse {
  body: { data: User[]; page: number; totalPage: number };
}

export interface GetSkillIdResponse {
  body: Skill;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  body: {
    user: User;
    tokens: Tokens;
  };
}

export interface PostSkillResponse {
  body: Skill;
}

describe('Skills module (e2e)', () => {
  let app: INestApplication<App>;

  let userRepo: Repository<User>;
  let categoryRepo: Repository<Category>;
  let skillRepo: Repository<Skill>;

  let testSkills: Skill[];
  let someTestSkill: Skill;

  const someTestUserRegisterData: RegisterDto = {
    email: 'test@skillsExample.com',
    name: 'Tests Skills',
    password: TestUserPassword,
    gender: Gender.MALE,
    avatar: 'default-avatar.png',
  };
  let someTestUser: User;

  let someTestCategory: Category;

  let createdTestSkill: Skill;

  let jwtToken: string;

  // Data for test

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

  it('User repository should not be empty, then getting data for the next tests.', async () => {
    const users = await userRepo.find();
    expect(users.length).toBeGreaterThanOrEqual(1);
  });

  it('Registering new user, Logging in, then getting data for the next tests.', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(someTestUserRegisterData)
      .expect(201);
    const authResponse: AuthResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: someTestUserRegisterData.email,
        password: someTestUserRegisterData.password,
      })
      .expect(200);
    someTestUser = authResponse.body.user;
    jwtToken = authResponse.body.tokens.accessToken;
  });

  it('Category repository should not be empty, then getting data for the next tests.', async () => {
    const cateogries = await categoryRepo.find();
    expect(cateogries.length).toBeGreaterThanOrEqual(1);
    someTestCategory = cateogries[0];
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

  it('GET /skills?category= should return a list of skills with a category.', async () => {
    const response: FindAllSkillsResponse = await request(app.getHttpServer())
      .get(`/skills?category=${someTestCategory.name}`)
      .expect(200);
    expect(response.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: someTestCategory,
        }),
      ]),
    );
  });

  it('GET /skills?search= should return a list of skills with a fitting name.', async () => {
    const response: FindAllSkillsResponse = await request(app.getHttpServer())
      .get(`/skills?search=${someTestSkill.title}`)
      .expect(200);
    expect(response.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: someTestSkill.title }),
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

  it('POST /skills/ should create a new skill', async () => {
    const postSkillTestData: CreateSkillDto = {
      title: 'PostSkillTest',
      description: 'Post Skill Test Desctiption',
      categoryId: someTestCategory.id,
    };

    const response: PostSkillResponse = await request(app.getHttpServer())
      .post('/skills/')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(postSkillTestData)
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        title: postSkillTestData.title,
        description: postSkillTestData.description,
      }),
    );
    createdTestSkill = response.body;
  });

  it('PATCH /skills/ should change a new skill', async () => {
    const patchSkillTestData: UpdateSkillDto = {
      title: 'PostSkillTestPatched',
      description: 'Patched description',
    };

    // console.log(createdTestSkill)
    const response = await request(app.getHttpServer())
      .patch(`/skills/${createdTestSkill.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(patchSkillTestData)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        title: patchSkillTestData.title,
        description: patchSkillTestData.description,
      }),
    );

    await request(app.getHttpServer())
      .patch(`/skills/${createdTestSkill.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        title: createdTestSkill.title,
        description: createdTestSkill.description,
      })
      .expect(200);
  });

  it('POST /skills/:id/favourite should add skill to favourite', async () => {
    const testSkillId = createdTestSkill.id;
    console.log(testSkillId)
    await request(app.getHttpServer())
      .post(`/skills/${testSkillId}/favorite`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(201);
  });

  it('DELETE /skills/:id/favorite should remove skill from favorites', async () => {
    const testSkillId = createdTestSkill.id;
    await request(app.getHttpServer())
      .delete(`/skills/${testSkillId}/favorite`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);
  });

  it('DELETE /skills/ should delete a new skill', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/skills/${createdTestSkill.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        title: createdTestSkill.title,
      }),
    );
  });

  it('Post test cleanup', async () => {
    await userRepo.remove(someTestUser);
  });

  afterAll(async () => {
    await app.close();
  });
});

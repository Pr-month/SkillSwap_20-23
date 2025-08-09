import { DataSource } from 'typeorm';

//надо создать в тестовой БД пользователя и выдать ему права

export async function resetTestDatabase(dataSource: DataSource) {
  // Сбрасываем схему (удаляем всё)
  await dataSource.query(`DROP SCHEMA public CASCADE`);
  await dataSource.query(`CREATE SCHEMA public`);

  // Расширение для uuid
  await dataSource.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

  // ENUM для пола и роли пользователя
  await dataSource.query(
    `CREATE TYPE "user_gender_enum" AS ENUM('male', 'female', 'other')`,
  );
  await dataSource.query(
    `CREATE TYPE "user_role_enum" AS ENUM('USER', 'ADMIN')`,
  );

  // ENUM для статуса запроса
  await dataSource.query(
    `CREATE TYPE "request_status_enum" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED')`,
  );

  // Таблица category
  await dataSource.query(`
    CREATE TABLE "category" (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      name varchar(100) NOT NULL,
      "parentId" uuid NULL,
      CONSTRAINT "UQ_category_name_parent" UNIQUE (name, "parentId"),
      CONSTRAINT "FK_category_parent" FOREIGN KEY ("parentId") REFERENCES category(id) ON DELETE CASCADE
    )
  `);

  // Таблица user
  await dataSource.query(`
    CREATE TABLE "user" (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      name text NOT NULL,
      email text UNIQUE NOT NULL,
      password text NOT NULL,
      about text,
      "birthDate" date,
      city text,
      gender "user_gender_enum" NOT NULL,
      avatar text NOT NULL,
      role "user_role_enum" NOT NULL DEFAULT 'USER',
      "refreshToken" varchar(255) UNIQUE NOT NULL
    )
  `);

  // Таблица skill
  await dataSource.query(`
    CREATE TABLE "skill" (
      id uuid PRIMARY KEY,
      title varchar(100) NOT NULL,
      description text,
      images text[] NULL,
      "ownerId" uuid NOT NULL,
      "categoryId" uuid NOT NULL,
      CONSTRAINT "FK_skill_owner" FOREIGN KEY ("ownerId") REFERENCES "user"(id) ON DELETE CASCADE,
      CONSTRAINT "FK_skill_category" FOREIGN KEY ("categoryId") REFERENCES category(id)
    )
  `);

  // Таблица request
  await dataSource.query(`
    CREATE TABLE "request" (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
      "senderId" uuid,
      "receiverId" uuid,
      status "request_status_enum" NOT NULL DEFAULT 'PENDING',
      "offeredSkillId" uuid,
      "requestedSkillId" uuid,
      "isRead" boolean NOT NULL,
      CONSTRAINT "FK_request_sender" FOREIGN KEY ("senderId") REFERENCES "user"(id),
      CONSTRAINT "FK_request_receiver" FOREIGN KEY ("receiverId") REFERENCES "user"(id),
      CONSTRAINT "FK_request_offeredSkill" FOREIGN KEY ("offeredSkillId") REFERENCES skill(id),
      CONSTRAINT "FK_request_requestedSkill" FOREIGN KEY ("requestedSkillId") REFERENCES skill(id)
    )
  `);

  // Связь many-to-many user.favoriteSkills <-> skill
  await dataSource.query(`
    CREATE TABLE "user_favorite_skills_skill" (
      "userId" uuid NOT NULL,
      "skillId" uuid NOT NULL,
      PRIMARY KEY ("userId", "skillId"),
      CONSTRAINT "FK_user_favorite_skills_user" FOREIGN KEY ("userId") REFERENCES "user"(id) ON DELETE CASCADE,
      CONSTRAINT "FK_user_favorite_skills_skill" FOREIGN KEY ("skillId") REFERENCES skill(id) ON DELETE CASCADE
    )
  `);

  // Связь many-to-many user.wantToLearn <-> category
  await dataSource.query(`
    CREATE TABLE "user_want_to_learn_category" (
      "userId" uuid NOT NULL,
      "categoryId" uuid NOT NULL,
      PRIMARY KEY ("userId", "categoryId"),
      CONSTRAINT "FK_user_want_to_learn_user" FOREIGN KEY ("userId") REFERENCES "user"(id) ON DELETE CASCADE,
      CONSTRAINT "FK_user_want_to_learn_category" FOREIGN KEY ("categoryId") REFERENCES category(id) ON DELETE CASCADE
    )
  `);

  // ==== ВСТАВКА ТЕСТОВЫХ ДАННЫХ ====

  // Вставляем категории
  await dataSource.query(`
    INSERT INTO category (id, name, "parentId") VALUES
    (uuid_generate_v4(), 'Music', NULL),
    (uuid_generate_v4(), 'Programming', NULL)
  `);

  // Вставляем пользователей
  await dataSource.query(`
    INSERT INTO "user" (id, name, email, password, role, gender, avatar, "refreshToken", about, "birthDate", city)
    VALUES
    (
      uuid_generate_v4(), 'Test User', 'test@example.com', 'hashed_password', 'USER', 'male', 'default-avatar.png', 'refresh_token_1', 'Just a test user', '2000-01-01', 'TestCity'
    ),
    (
      uuid_generate_v4(), 'Admin User', 'admin@example.com', 'hashed_password', 'ADMIN', 'female', 'default-avatar.png', 'refresh_token_2', 'Admin account', '1995-05-05', 'AdminCity'
    )
  `);

  // Вставляем навыки с правильными внешними ключами (берём id из пользователей и категорий)
  await dataSource.query(`
    INSERT INTO skill (id, title, description, images, "ownerId", "categoryId")
    VALUES
    (
      uuid_generate_v4(),
      'Guitar Playing',
      'Can play acoustic guitar',
      ARRAY['img1.png', 'img2.png'],
      (SELECT id FROM "user" WHERE email = 'test@example.com'),
      (SELECT id FROM category WHERE name = 'Music')
    ),
    (
      uuid_generate_v4(),
      'JavaScript',
      'Knows JS and Node.js',
      ARRAY['js1.png'],
      (SELECT id FROM "user" WHERE email = 'admin@example.com'),
      (SELECT id FROM category WHERE name = 'Programming')
    )
  `);

  // Вставляем запрос
  await dataSource.query(`
    INSERT INTO request (id, "createdAt", "senderId", "receiverId", status, "offeredSkillId", "requestedSkillId", "isRead")
    VALUES
    (
      uuid_generate_v4(),
      now(),
      (SELECT id FROM "user" WHERE email = 'test@example.com'),
      (SELECT id FROM "user" WHERE email = 'admin@example.com'),
      'PENDING',
      (SELECT id FROM skill WHERE title = 'Guitar Playing'),
      (SELECT id FROM skill WHERE title = 'JavaScript'),
      false
    )
  `);

  // Можно добавить сиды для many-to-many, если надо

  // Например, user_favorite_skills_skill
  await dataSource.query(`
    INSERT INTO user_favorite_skills_skill ("userId", "skillId")
    VALUES
    (
      (SELECT id FROM "user" WHERE email = 'test@example.com'),
      (SELECT id FROM skill WHERE title = 'JavaScript')
    )
  `);

  // user_want_to_learn_category
  await dataSource.query(`
    INSERT INTO user_want_to_learn_category ("userId", "categoryId")
    VALUES
    (
      (SELECT id FROM "user" WHERE email = 'test@example.com'),
      (SELECT id FROM category WHERE name = 'Programming')
    )
  `);
}

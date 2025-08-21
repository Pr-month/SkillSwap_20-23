import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { User } from '../users/entities/user.entity';
import { TestUsersData, TestUserPassword } from './users.data';
import * as bcrypt from 'bcrypt';

export async function seedUsersTest(userRepo: Repository<User>) {
  console.log('НАЧИНАЮ СИДИРОВАНИЕ ПОЛЬЗОВАТЕЛЕЙ!');
  const password = await bcrypt.hash(TestUserPassword, 10);

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
        password: password,
      }),
    );
  }

  console.log('Пользователи успешно добавлены в базу данных');
}

async function seed() {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);

  try {
    await seedUsersTest(userRepo);
  } catch (error) {
    console.error('Ошибка при добавлении тестовых пользователей:', error);
  }
  await AppDataSource.destroy();
}

seed().catch((e) => {
  console.error('Ошибка при добавлении пользователей:', e);
  process.exit(1);
});

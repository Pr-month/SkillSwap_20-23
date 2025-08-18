import { AppDataSource } from '../config/data-source';
import { User } from '../users/entities/user.entity';
import { TestUsersData } from './users.data';
import * as bcrypt from 'bcrypt';

async function seed() {
  console.log('НАЧИНАЮ СИДИРОВАНИЕ ПОЛЬЗОВАТЕЛЕЙ!');
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);

  try {
    const password = await bcrypt.hash('test123', 10);

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
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Ошибка при добавлении тестовых пользователей:', error);
  }
}

seed().catch((e) => {
  console.error('Ошибка при добавлении пользователей:', e);
  process.exit(1);
});

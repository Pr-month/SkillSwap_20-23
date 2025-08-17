import { AppDataSource } from '../config/data-source';
import { User } from '../users/entities/user.entity';
import { TestUsersData } from './users.data';

async function seed() {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);

  try {
    for (const user of TestUsersData) {
      const thisUser = await userRepo.findOne({
        where: { email: user.email },
      });

      if (thisUser) {
        await userRepo.remove([thisUser]);
      }
    }

    console.log('Пользователи успешно удалены');
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Ошибка при добавлении тестовых пользователей:', error);
  }
}

seed().catch((e) => {
  console.error('Ошибка при добавлении пользователей:', e);
  process.exit(1);
});

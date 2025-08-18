import { AppDataSource } from '../config/data-source';
import { User } from '../users/entities/user.entity';
import { AdminUsersData, AdminUsersPassword } from './users.data';
import * as bcrypt from 'bcrypt';
import { Role } from '../common/types';

async function seed() {
  console.log('НАЧИНАЮ СИДИРОВАНИЕ АДМИНИСТРАТОРА! ');
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);

  try {
    const existingAdmin = await userRepo.findOne({
      where: { email: AdminUsersData.email, role: Role.ADMIN },
    });
    if (existingAdmin && existingAdmin.email === AdminUsersData.email) {
      console.log('Администратор уже существует');
      return;
    }

    const user = await userRepo.save(
      userRepo.create({
        ...AdminUsersData,
        password: await bcrypt.hash(AdminUsersPassword, 10),
      }),
    );

    await userRepo.save(user);

    console.log('Администратор успешно добавлены в базу данных');
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Ошибка при добавлении администратора:', error);
  }
}

seed().catch((e) => {
  console.error('Ошибка при добавлении администратора:', e);
  process.exit(1);
});

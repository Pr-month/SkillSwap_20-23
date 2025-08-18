import { Skill } from '../skills/entities/skill.entity';
import { AppDataSource } from '../config/data-source';
import { User } from '../users/entities/user.entity';
import { TestUsersData } from './users.data';
import { Category } from '../categories/entities/category.entity';

async function seed() {
  console.log('НАЧИНАЮ СИДИРОВАНИЕ НАВЫКОВ!');
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);
  const skillRepo = AppDataSource.getRepository(Skill);
  const categoryRepo = AppDataSource.getRepository(Category);

  try {
    for (const user of TestUsersData) {
      const thisUser = await userRepo.findOne({
        where: { email: user.email },
      });

      if (!thisUser) {
        console.log(`Пользователь ${user.name} не существует!`);
        return;
      }

      const thisSkill = await skillRepo.findOne({
        where: { owner: thisUser },
      });

      if (thisSkill) {
        console.log(`Навык уже существует! ${thisSkill.title}`);
        return;
      }

      const commonCategory = await categoryRepo.findOne({
        where: { name: 'Backend' },
      });

      if (!commonCategory) {
        console.log('Категории BACKEND не существует.');
        return;
      }
      await skillRepo.save(
        skillRepo.create({
          title: `${thisUser.name} skill in ${commonCategory.name}`,
          description: `Description of ${thisUser.name} skill in ${commonCategory.name}`,
          images: ['some.jpg'],
          category: commonCategory,
          owner: thisUser,
        }),
      );

      await userRepo.save({
        ...thisUser,
        wantToLearn: [commonCategory],
      });
    }

    console.log('Навыки успешно добавлены в базу данных');
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Ошибка при добавлении тестовых навыков:', error);
  }
}

seed().catch((e) => {
  console.error('Ошибка при добавлении навыков:', e);
  process.exit(1);
});

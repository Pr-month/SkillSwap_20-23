import { AppDataSource } from '../config/data-source';
import { Skill } from '../skills/entities/skill.entity';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';

// Тестовые данные для навыков
const TestSkills = [
  {
    title: 'Веб-разработка на JavaScript',
    description: 'Создание современных веб-приложений с использованием React, Node.js и Express',
    images: ['web1.jpg', 'web2.jpg'],
    ownerEmail: 'test1@example.com', // email тестового пользователя
    categoryName: 'Программирование'
  },
  {
    title: 'Графический дизайн',
    description: 'Создание логотипов, брендбуков и маркетинговых материалов',
    images: ['design1.jpg', 'design2.jpg'],
    ownerEmail: 'test2@example.com',
    categoryName: 'Дизайн'
  },
  {
    title: 'Английский язык для IT',
    description: 'Преподавание технического английского для программистов',
    images: ['english1.jpg'],
    ownerEmail: 'test3@example.com',
    categoryName: 'Обучение'
  },
  {
    title: 'Фотография продукта',
    description: 'Профессиональная съемка товаров для интернет-магазинов',
    images: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'],
    ownerEmail: 'test1@example.com',
    categoryName: 'Фотография'
  },
  {
    title: 'Копирайтинг для сайтов',
    description: 'Написание продающих текстов и SEO-статей',
    images: ['copy1.jpg'],
    ownerEmail: 'test2@example.com',
    categoryName: 'Маркетинг'
  }
];

async function seed() {
  try {
    await AppDataSource.initialize();
    const skillRepo = AppDataSource.getRepository(Skill);
    const userRepo = AppDataSource.getRepository(User);
    const categoryRepo = AppDataSource.getRepository(Category);

    // Проверяем, есть ли уже тестовые навыки
    const existingSkills = await skillRepo
      .createQueryBuilder('skill')
      .leftJoinAndSelect('skill.owner', 'user')
      .where('user.email LIKE :email', { email: '%test%@example.com' })
      .getCount();

    if (existingSkills > 0) {
      console.log('Тестовые навыки уже существуют в базе данных');
      await AppDataSource.destroy();
      return;
    }

    console.log('Начинаем сидирование тестовых навыков...');

    // Создаем навыки
    for (const skillData of TestSkills) {
      // Находим пользователя по email
      const user = await userRepo.findOne({
        where: { email: skillData.ownerEmail }
      });

      if (!user) {
        console.warn(`Пользователь с email ${skillData.ownerEmail} не найден, пропускаем навык: ${skillData.title}`);
        continue;
      }

      // Находим категорию по имени
      const category = await categoryRepo.findOne({
        where: { name: skillData.categoryName }
      });

      if (!category) {
        console.warn(`Категория "${skillData.categoryName}" не найдена, пропускаем навык: ${skillData.title}`);
        continue;
      }

      // Создаем и сохраняем навык
      const skill = skillRepo.create({
        title: skillData.title,
        description: skillData.description,
        images: skillData.images,
        owner: user,
        category: category
      });

      await skillRepo.save(skill);
      console.log(`Создан навык: ${skillData.title} для пользователя ${user.email}`);
    }

    console.log('Тестовые навыки успешно добавлены в базу данных');
    
  } catch (error) {
    console.error('Ошибка при добавлении тестовых навыков:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

// Запуск сидирования
seed().catch((error) => {
  console.error('Необработанная ошибка в скрипте сидирования:', error);
  process.exit(1);
});
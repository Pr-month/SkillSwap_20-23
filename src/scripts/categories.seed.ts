import { AppDataSource } from '../config/data-source';
import { Category } from '../categories/entities/category.entity';
import { Categories } from './categories.data';
import { Repository } from 'typeorm';

export async function seedCategories(categoryRepo: Repository<Category>) {
  console.log('НАЧИНАЮ СИДИРОВАНИЕ КАТЕГОРИЙ! ');
  // проверяем, есть ли уже данные в таблице
  const existing = await categoryRepo.count();
  if (existing > 0) {
    return;
  }
  // создаем все категории с использованием Promise.all для оптимизации
  await Promise.all(
    Categories.map(async (categoryData) => {
      // Создаем родительскую категорию
      const parentCategory = await categoryRepo.save(
        categoryRepo.create({ name: categoryData.name }),
      );

      // создаем дочерние категории для текущего родителя
      await Promise.all(
        categoryData.children.map((childName) =>
          categoryRepo.save(
            categoryRepo.create({
              name: childName,
              parent: parentCategory,
            }),
          ),
        ),
      );
    }),
  );

  // завершение работы
  console.log('Категории успешно добавлены в базу данных');
}

async function seed() {
  await AppDataSource.initialize(); // инициализация подключения к БД
  const categoryRepo = AppDataSource.getRepository(Category); // получаем репозиторий для работы с категориями
  await seedCategories(categoryRepo);
  await AppDataSource.destroy();
}

// обработка ошибок
seed().catch((e) => {
  console.error('Ошибка при добавлении категорий:', e);
  process.exit(1);
});

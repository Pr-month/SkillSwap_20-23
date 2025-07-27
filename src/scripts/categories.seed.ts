import { AppDataSource } from '../config/data-source';
import { Category } from '../categories/entities/category.entity';
import { Categories } from './categories.data';

async function seed() {
  await AppDataSource.initialize(); // инициализация подключения к БД
  const categoryRepo = AppDataSource.getRepository(Category); // получаем репозиторий для работы с категориями

  // проверяем, есть ли уже данные в таблице
  const existing = await categoryRepo.count();
  if (existing > 0) {
    await AppDataSource.destroy();
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
  await AppDataSource.destroy();
}

// обработка ошибок
seed().catch((e) => {
  console.error('Ошибка при добавлении категорий:', e);
  process.exit(1);
});

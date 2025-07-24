import { AppDataSource } from '../config/data-source';
import { Category } from '../categories/entities/category.entity';
 
//данные для сидирования: name - название родительской категории, children - массив названий дочерних категорий
const categories = [
  {
    name: 'Творчество и искусство',
    children: [
      'Управление командой',
      'Маркетинг и реклама',
      'Продажи и переговоры',
      'Личный бренд',
      'Резюме и собеседование',
      'Тайм-менеджмент',
      'Проектное управление',
      'Предпринимательство',
    ],
  },
  {
    name: 'IT и программирование',
    children: [
      'Frontend',
      'Backend',
      'DevOps',
      'Мобильная разработка',
      'GameDev',
    ],
  },
  {
    name: 'Дизайн и UX/UI',
    children: ['Графический дизайн', 'UX/UI', 'Motion-дизайн', 'Web-дизайн'],
  },
  {
    name: 'Финансы и бухгалтерия',
    children: [
      'Личная финансовая грамотность',
      'Бухгалтерия и налоги',
      'Инвестиции',
    ],
  },
  {
    name: 'Маркетинг и продажи',
    children: ['Таргетинг', 'Контекстная реклама', 'SEO', 'Email-маркетинг'],
  },
  {
    name: 'Образование и обучение',
    children: ['Методика преподавания', 'Онлайн-курсы', 'Педагогика'],
  },
  {
    name: 'Языки',
    children: [
      'Английский язык',
      'Немецкий язык',
      'Французский язык',
      'Испанский язык',
      'Китайский язык',
      'Русский язык',
    ],
  },
  {
    name: 'Музыкальные инструменты',
    children: [
      'Гитара',
      'Фортепиано',
      'Скрипка',
      'Ударные',
      'Вокал',
      'Бас-гитара',
      'Саксофон',
    ],
  },
];

async function seed() {
  await AppDataSource.initialize(); // инициализация подключения к БД
  const categoryRepo = AppDataSource.getRepository(Category); // получаем репозиторий для работы с категориями

// проверяем, есть ли уже данные в таблице
  const existing = await categoryRepo.count();
  if (existing > 0) {
    await AppDataSource.destroy();
    return;
  }

// создаем родительские категории
  for (const categoryData of categories) {
    const parentCategory = new Category();
    parentCategory.name = categoryData.name;
    await categoryRepo.save(parentCategory);

// создаем дочерние категории
    for (const childName of categoryData.children) {
      const childCategory = new Category();
      childCategory.name = childName;
      childCategory.parent = parentCategory;
      await categoryRepo.save(childCategory);
    }
  }
// завершение работы
  console.log('Категории успешно добавлены в базу данных');
  await AppDataSource.destroy();
}

// обработка ошибок
seed().catch((e) => {
  console.error('Ошибка при добавлении категорий:', e);
  process.exit(1);
});
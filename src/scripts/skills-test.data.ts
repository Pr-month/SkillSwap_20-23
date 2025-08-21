export interface TestSkillData {
  title: string;
  description: string;
  images: string[];
  ownerEmail: string;
  categoryName: string;
}

// Тестовые данные для навыков
export const TestSkills:TestSkillData[] = [
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
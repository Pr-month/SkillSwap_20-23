export interface TestSkillData {
  title: string;
  description: string;
  images: string[];
  ownerEmail: string;
  categoryName: string;
}

export const TestSkills: TestSkillData[] = [
  {
    title: 'Веб-разработка на JavaScript',
    description: 'Создание современных веб-приложений с использованием React, Node.js и Express',
    images: ['web1.jpg', 'web2.jpg'],
    ownerEmail: 'test1@example.com',
    categoryName: 'Программирование'
  },
  // ... остальные навыки ...
];
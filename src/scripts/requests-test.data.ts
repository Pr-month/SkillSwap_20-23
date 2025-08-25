export interface TestRequestData {
  offeredSkillTitle: string;
  requestedSkillTitle: string;
  senderEmail: string;
  receiverEmail: string;
  status?: string;
  isRead?: boolean;
}

// Тестовые данные для заявок
export const TestRequests: TestRequestData[] = [
  {
    offeredSkillTitle: 'Веб-разработка на JavaScript',
    requestedSkillTitle: 'Графический дизайн',
    senderEmail: 'test1@example.com',
    receiverEmail: 'test2@example.com',
    status: 'PENDING',
    isRead: false
  },
  {
    offeredSkillTitle: 'Графический дизайн',
    requestedSkillTitle: 'Английский язык для IT',
    senderEmail: 'test2@example.com',
    receiverEmail: 'test3@example.com',
    status: 'PENDING',
    isRead: false
  },
  {
    offeredSkillTitle: 'Английский язык для IT',
    requestedSkillTitle: 'Фотография продукта',
    senderEmail: 'test3@example.com',
    receiverEmail: 'test1@example.com',
    status: 'ACCEPTED',
    isRead: true
  },
  {
    offeredSkillTitle: 'Фотография продукта',
    requestedSkillTitle: 'Копирайтинг для сайтов',
    senderEmail: 'test1@example.com',
    receiverEmail: 'test2@example.com',
    status: 'REJECTED',
    isRead: true
  },
  {
    offeredSkillTitle: 'Копирайтинг для сайтов',
    requestedSkillTitle: 'Веб-разработка на JavaScript',
    senderEmail: 'test2@example.com',
    receiverEmail: 'test1@example.com',
    status: 'INPROGRESS',
    isRead: true
  }
];
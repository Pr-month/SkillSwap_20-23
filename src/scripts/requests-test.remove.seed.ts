import { AppDataSource } from '../config/data-source';
import { Request } from '../requests/entities/request.entity';

async function removeTestRequests() {
  try {
    await AppDataSource.initialize();
    const requestRepo = AppDataSource.getRepository(Request);

    // Удаляем все тестовые заявки (связанные с тестовыми пользователями)
    const deleteResult = await requestRepo
      .createQueryBuilder('request')
      .delete()
      .where('request.senderId IN (SELECT id FROM "user" WHERE email LIKE :email)', {
        email: '%test%@example.com'
      })
      .orWhere('request.receiverId IN (SELECT id FROM "user" WHERE email LIKE :email)', {
        email: '%test%@example.com'
      })
      .execute();

    console.log(`Удалено ${deleteResult.affected} тестовых заявок`);

  } catch (error) {
    console.error('Ошибка при удалении тестовых заявок:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

// Запуск удаления
removeTestRequests().catch((error) => {
  console.error('Необработанная ошибка в скрипте удаления:', error);
  process.exit(1);
});
import { AppDataSource } from '../config/data-source';
import { Skill } from '../skills/entities/skill.entity';

async function removeTestSkills() {
  try {
    await AppDataSource.initialize();
    const skillRepo = AppDataSource.getRepository(Skill);

    // Удаляем все тестовые навыки (связанные с тестовыми пользователями)
    const deleteResult = await skillRepo
      .createQueryBuilder('skill')
      .delete()
      .where(
        'skill.ownerId IN (SELECT id FROM "user" WHERE email LIKE :email)',
        {
          email: '%test%@example.com',
        },
      )
      .execute();

    console.log(`Удалено ${deleteResult.affected} тестовых навыков`);
  } catch (error) {
    console.error('Ошибка при удалении тестовых навыков:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

// Запуск удаления
removeTestSkills().catch((error) => {
  console.error('Необработанная ошибка в скрипте удаления:', error);
  process.exit(1);
});

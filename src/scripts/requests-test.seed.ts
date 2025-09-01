import { AppDataSource } from '../config/data-source';
import { Request } from '../requests/entities/request.entity';
import { User } from '../users/entities/user.entity';
import { Skill } from '../skills/entities/skill.entity';
import { TestRequests } from './requests-test.data';
import { ReqStatus } from '../common/requests-status.enum';

async function seed() {
  try {
    await AppDataSource.initialize();
    const requestRepo = AppDataSource.getRepository(Request);
    const userRepo = AppDataSource.getRepository(User);
    const skillRepo = AppDataSource.getRepository(Skill);

    console.log('Начинаем сидирование тестовых заявок...');

    // Создаем заявки
    for (const requestData of TestRequests) {
      try {
        // Находим отправителя и получателя по email
        const [sender, receiver] = await Promise.all([
          userRepo.findOne({ where: { email: requestData.senderEmail } }),
          userRepo.findOne({ where: { email: requestData.receiverEmail } }),
        ]);

        if (!sender) {
          console.warn(
            `Отправитель с email ${requestData.senderEmail} не найден, пропускаем заявку`,
          );
          continue;
        }

        if (!receiver) {
          console.warn(
            `Получатель с email ${requestData.receiverEmail} не найден, пропускаем заявку`,
          );
          continue;
        }

        // Находим навыки по названию и владельцу
        const [offeredSkill, requestedSkill] = await Promise.all([
          skillRepo.findOne({
            where: {
              title: requestData.offeredSkillTitle,
              owner: { id: sender.id },
            },
            relations: ['owner'],
          }),
          skillRepo.findOne({
            where: {
              title: requestData.requestedSkillTitle,
              owner: { id: receiver.id },
            },
            relations: ['owner'],
          }),
        ]);

        if (!offeredSkill) {
          console.warn(
            `Навык "${requestData.offeredSkillTitle}" не найден у пользователя ${sender.email}, пропускаем заявку`,
          );
          continue;
        }

        if (!requestedSkill) {
          console.warn(
            `Навык "${requestData.requestedSkillTitle}" не найден у пользователя ${receiver.email}, пропускаем заявку`,
          );
          continue;
        }

        // Проверяем, не существует ли уже такая заявка
        const existingRequest = await requestRepo.findOne({
          where: {
            sender: { id: sender.id },
            receiver: { id: receiver.id },
            offeredSkill: { id: offeredSkill.id },
            requestedSkill: { id: requestedSkill.id },
          },
        });

        if (existingRequest) {
          console.warn(
            `Заявка уже существует, пропускаем: ${requestData.offeredSkillTitle} -> ${requestData.requestedSkillTitle}`,
          );
          continue;
        }

        // Преобразуем строковый статус в enum значение
        let status: ReqStatus;
        switch (requestData.status?.toUpperCase()) {
          case 'PENDING':
            status = ReqStatus.PENDING;
            break;
          case 'ACCEPTED':
            status = ReqStatus.ACCEPTED;
            break;
          case 'REJECTED':
            status = ReqStatus.REJECTED;
            break;
          case 'INPROGRESS':
            status = ReqStatus.INPROGRESS;
            break;
          case 'DONE':
            status = ReqStatus.DONE;
            break;
          default:
            status = ReqStatus.PENDING;
        }

        // Создаем и сохраняем заявку
        const request = requestRepo.create({
          sender,
          receiver,
          offeredSkill,
          requestedSkill,
          status: status,
          isRead: requestData.isRead || false,
        });

        await requestRepo.save(request);
        console.log(
          `Создана заявка: ${sender.email} предлагает "${offeredSkill.title}" для "${requestedSkill.title}" со статусом ${status}`,
        );
      } catch (error) {
        console.error(
          `Ошибка при создании заявки между ${requestData.senderEmail} и ${requestData.receiverEmail}:`,
          error,
        );
      }
    }

    console.log('Тестовые заявки успешно добавлены в базу данных');
  } catch (error) {
    console.error('Ошибка при добавлении тестовых заявок:', error);
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

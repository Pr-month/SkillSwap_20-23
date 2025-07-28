import { AppDataSource } from '../config/data-source';
import { User } from '../users/entities/user.entity';
import { TestUsersData } from "./users.data";
import * as bcrypt from 'bcrypt';

async function seed() {
    await AppDataSource.initialize();
    const userRepo = AppDataSource.getRepository(User);

    try {
        const password = await bcrypt.hash('test123', 10);

        for (const user of TestUsersData) {
            userRepo.create({
                ...user,
                password: password,
            });
        }

        console.log('Пользователи успешно добавлены в базу данных');
        await AppDataSource.destroy();

    } catch (error) {
        console.error('Ошибка при добавлении тестовых пользователей:', error);
    }
}

seed().catch((e) => {
    console.error('Ошибка при добавлении пользователей:', e);
    process.exit(1);
});

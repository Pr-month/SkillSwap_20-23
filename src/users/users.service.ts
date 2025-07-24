import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findUserById(id: string) {
    const user = await this.userRepository.findOneOrFail({ where: { id } });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, refreshToken, ...returnValues } = user;
    return returnValues;
  }

  async updateUserById(id: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userRepository.findOneOrFail({ where: { id } });
      const mergedUser = this.userRepository.merge(user, updateUserDto);
      const savedUser = await this.userRepository.save(mergedUser);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, refreshToken, ...updatedUser } = savedUser;

      return updatedUser;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      throw new InternalServerErrorException('Failed to update user', error);
    }
  }

  async updatePassword(
    userId: string, // Принимаем ID пользователя
    currentPassword: string, // Текущий пароль для проверки
    newPassword: string, // Новый пароль для установки
  ): Promise<void> {
    // Поиск пользователя с выборкой конкретных полей
    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
      select: ['id', 'password'], // Явно указываем нужные поля
    });

    // Проверка совпадения текущего пароля
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Неверный пароль');
    }

    // Проверка, что новый пароль не совпадает с текущим
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    if (await bcrypt.compare(newPassword, user.password)) {
      throw new ConflictException('Новый пароль должен отличаться от текущего');
    }

    //Проверка минимальной длины нового пароля
    if (newPassword.length < 8) {
      throw new BadRequestException('Пароль должен быть не менее 8 символов');
    }

    // Хеширование нового пароля
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const hashedNewPassword = await bcrypt.hash(newPassword, 12); // Увеличили salt rounds
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    user.password = hashedNewPassword; // Обновление пароля
    await this.userRepository.save(user); // Сохранение изменений
  }
}

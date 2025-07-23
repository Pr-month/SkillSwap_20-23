import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { DeepPartial, Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) { }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findUserById(id: string) {
    const user = await this.userRepository.findOneOrFail({ where: { id } });
    const { password, refreshToken, ...returnValues } = user;
    return returnValues;
  }

  async updateUserById(id: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userRepository.findOneOrFail({ where: { id } });
      const mergedUser = this.userRepository.merge(user, updateUserDto);
      const savedUser = await this.userRepository.save(mergedUser);
      const { password, refreshToken, ...updatedUser } = savedUser;

      return updatedUser;
    } catch (error) {
      throw new InternalServerErrorException('Failed to update user');
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
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Неверный пароль');
    }

    // Проверка, что новый пароль не совпадает с текущим
    if (await bcrypt.compare(newPassword, user.password)) {
      throw new ConflictException('Новый пароль должен отличаться от текущего');
    }

    //Проверка минимальной длины нового пароля
    if (newPassword.length < 8) {
      throw new BadRequestException('Пароль должен быть не менее 8 символов');
    }

    // Хеширование нового пароля
    const hashedNewPassword = await bcrypt.hash(newPassword, 12); // Увеличили salt rounds
    user.password = hashedNewPassword; // Обновление пароля
    await this.userRepository.save(user); // Сохранение изменений
  }
}

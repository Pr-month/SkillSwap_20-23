import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  create(createUserDto: CreateUserDto) {
    //Затычка линтинга
    return this.userRepository.create(createUserDto);
  }

  async findUserById(id: string) {
    const user = await this.userRepository.findUserById(id);

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }
    // Поскольку пароль и рефереш токен надо выкинуть оставлю здесь эту линию
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, refreshToken, ...returnValues } = user;
    return returnValues;
  }

  async updateUserById(id: string, updateUserDto: UpdateUserDto) {
    // Поскольку пароль и рефереш токен надо выкинуть оставлю здесь эту линию
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, refreshToken, ...updatedUser } =
      await this.userRepository.updateUserById(id, updateUserDto);
    return updatedUser;
  }

  async updatePassword(
    userId: string,          // Принимаем ID пользователя
    currentPassword: string, // Текущий пароль для проверки
    newPassword: string,     // Новый пароль для установки
  ): Promise<void> {

    // Поиск пользователя с выборкой конкретных полей
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'password'] // Явно указываем нужные поля
    });

    // Проверка существования пользователя
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Проверка совпадения текущего пароля
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Неверный пароль');
    }

    // Проверка, что новый пароль не совпадает с текущим
    if (await bcrypt.compare(newPassword, user.password)) {
      throw new BadRequestException('Новый пароль должен отличаться от текущего');
    }

    //Проверка минимальной длины нового пароля 
    if (newPassword.length < 8) {
      throw new BadRequestException('Пароль должен быть не менее 8 символов');
    }

    // Хеширование нового пароля
    const hashedNewPassword = await bcrypt.hash(newPassword, 12); // Увеличили salt rounds
    user.password = hashedNewPassword;   // Обновление пароля
    await this.usersRepository.save(user); // Сохранение изменений
  }
}



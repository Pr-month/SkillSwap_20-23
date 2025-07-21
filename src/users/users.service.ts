import { Injectable, NotFoundException,UnauthorizedException, BadRequestException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import {User} from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>, // Инъекция репозитория
  ) {}

  create(createUserDto: CreateUserDto) {
    //Затычка линтинга
    console.log('Creating a user:');
    console.log(createUserDto);
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    //Затычка линтинга
    console.log('Updating a user:');
    console.log(updateUserDto);
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  //обновление пароля 
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


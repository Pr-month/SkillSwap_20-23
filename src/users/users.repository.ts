import {
  NotFoundException,
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findUserById(id: string) {
    if (!id) {
      throw new BadRequestException('ID пользователя не задан!');
    }
    try {
      const user = await this.findOne({ where: { id } });
      if (!user) {
        throw new UnauthorizedException('Пользователь не найден');
      }
      return user;
    } catch {
      throw new NotFoundException(`Пользователь с id ${id} не найден!`);
    }
  }

  async updateUserById(id: string, updateUserDto: UpdateUserDto) {
    if (!id) {
      throw new BadRequestException('ID пользователя не задан!');
    }
    const user = await this.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Пользователь с id ${id} не найден!`);
    }

    const { name, email, age, city, gender, avatar, about } = updateUserDto;
    user.name = name;
    user.email = email;
    user.age = age;
    user.city = city;
    user.gender = gender;
    user.avatar = avatar;
    user.about = about;
    const updatedUser = await this.save(user);

    return updatedUser;
  }

  async findUserByMail(email: string): Promise<User | undefined> {
    if (!email) {
      throw new BadRequestException('Email пользователя не задан!');
    }
    try {
      const response = await this.findOne({
        where: { email },
      });
      if (!response) {
        throw new NotFoundException(
          `Пользователь с почтой ${email} не найден!`,
        );
      }
      return response;
    } catch {
      throw new NotFoundException(`Пользователь с почтой ${email} не найден!`);
    }
  }

  async updateRefreshToken(userId: string, newRefreshToken: string) {
    if (!userId) {
      throw new BadRequestException('ID пользователя не задан!');
    }
    const user = await this.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new BadRequestException('Пользователь не найден');
    }
    user.refreshToken = newRefreshToken;
    try {
      await this.save(user);
    } catch {
      new BadRequestException(`Не удалось обновить пользователя!`);
    }

    return user;
  }
}

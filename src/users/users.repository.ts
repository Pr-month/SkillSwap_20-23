import {
  NotFoundException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findUserByMail(email: string): Promise<User | undefined> {
    try {
      console.log(`EMAIL: ${email}`);
      const response = await this.findOne({
        where: { email },
      });
      if (!response) {
        console.log('ERROR1!');
        throw new NotFoundException(
          `Пользователь с почтой ${email} не найден!`,
        );
      }
      return response;
    } catch (error) {
      console.log('ERROR2!');
      console.log(error);
      throw new NotFoundException(`Пользователь с почтой ${email} не найден!`);
    }
  }

  async updateRefreshToken(userId: string, newRefreshToken: string) {
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

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/users.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './users.repository';
import { IUserWithoutSensitive } from 'src/types/userWithoutSensitive';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: UserRepository,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findId(id: string): Promise<IUserWithoutSensitive> {
    const user = await this.usersRepository.findOneOrFail({ where: { id } });

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }
    return user;
  }

  async updateUserById(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<IUserWithoutSensitive> {
    const updatedUser: IUserWithoutSensitive =
      await this.usersRepository.updateUserById(id, updateUserDto);
    return updatedUser;
  }
}

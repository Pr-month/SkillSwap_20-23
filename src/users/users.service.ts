import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/users.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: UserRepository,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findId(id: string) {
    const user = await this.usersRepository.findOneOrFail({ where: { id } });

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }
    const { password, refreshtoken, ...returnValues } = user;
    return returnValues;
  }

  async updateUserById(id: string, updateUserDto: UpdateUserDto) {
    // Поскольку пароль и рефереш токен надо выкинуть оставлю здесь эту линию
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, refreshtoken, ...updatedUser } =
      await this.usersRepository.updateUserById(id, updateUserDto);
    return updatedUser;
  }
}

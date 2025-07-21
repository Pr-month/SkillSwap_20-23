import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './users.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
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
}

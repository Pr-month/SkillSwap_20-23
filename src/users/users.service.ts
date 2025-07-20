import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './users.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async findUserById(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }
    // Поскольку пароль и рефереш токен надо выкинуть оставлю здесь эту линию
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, refreshToken, ...returnValues } = user;
    return returnValues;
  }

  async updateUserById(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    const { name, email, age, city, gender, avatar } = updateUserDto;
    user.name = name;
    user.email = email;
    user.age = age;
    user.city = city;
    user.gender = gender;
    user.avatar = avatar;

    const newUser = await this.userRepository.save(user);

    // Поскольку пароль и рефереш токен надо выкинуть оставлю здесь эту линию
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, refreshToken, ...returnValues } = newUser;

    return returnValues;
  }
}

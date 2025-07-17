import { Injectable, UnauthorizedException } from '@nestjs/common';
//import { UsersService } from 'src/users/users.service';
import { UsersService } from 'src/usersMock/usersMock.service'; // Это моки затычки чтобы проверить работоспособность Auth Login
import { JwtService } from '@nestjs/jwt';
import { returnSignInDto } from 'src/auth/dto/signInDto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(username: string, pass: string): Promise<returnSignInDto> {
    const user = await this.usersService.findOne(username);
    if (!user) {
      throw new Error('Пользователь не найден');
    }
    const hashedPassword = user.password;
    const isMatch = await bcrypt.compare(pass, hashedPassword);
    if (!isMatch) {
      throw new UnauthorizedException('Ошибка авторизации.');
    }

    //Вот это создает accessToken
    const payload = { username: user.name };
    const accessToken = await this.jwtService.signAsync(payload);

    const refreshToken = user.refreshToken; // Здесь должна быть функция создающая Refresh Token
    return {
      user,
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }
}

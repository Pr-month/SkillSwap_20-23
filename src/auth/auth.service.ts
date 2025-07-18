import { Injectable, UnauthorizedException } from '@nestjs/common';
//import { UsersService } from 'src/users/users.service';
import { UsersService } from 'src/usersMock/usersMock.service'; // Это моки затычки чтобы проверить работоспособность Auth Login
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  getTokensDTO,
  returnGetTokensDTO,
  returnSignInDto,
  signInDto,
} from 'src/auth/dto/signInDto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async getTokens(payload: getTokensDTO): Promise<returnGetTokensDTO> {
    //Вот это создает accessToken
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(
      { sub: payload.userId },
      {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRATION'),
      },
    );
    return { accessToken, refreshToken };
  }

  async signIn(userData: signInDto): Promise<returnSignInDto> {
    const user = await this.usersService.findOne(userData.username);
    if (!user) {
      throw new Error('Пользователь не найден');
    }

    const hashedPassword = user.password;
    const isMatch = await bcrypt.compare(userData.password, hashedPassword);
    if (!isMatch) {
      throw new UnauthorizedException('Ошибка авторизации.');
    }

    const payload: getTokensDTO = {
      username: user.name,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
    };

    const { accessToken, refreshToken } = await this.getTokens(payload);

    // Обновление RefreshToken в пользователе
    const newUser = await this.usersService.updateRefreshToken(
      user.id,
      refreshToken,
    );

    return {
      user: newUser,
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }
}

import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { returnJwtToken, JwtPayload } from './types';
import { Role } from 'src/common/types';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async _getTokens(user: {
    id: string;
    email: string;
    role?: Role;
  }): Promise<returnJwtToken> {
    //Вот это создает accessToken

    const payload: JwtPayload = {
      userEmail: user.email,
      userId: user.id,
      userRole: user.role || Role.USER,
    };

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

  async create(createAuthDto: CreateAuthDto) {
    const { email, password } = createAuthDto;

    const saltRound = 10;

    const passwordHash: string = await bcrypt.hash(password, saltRound);

    const id: string = uuidv4();

    const payload = {
      id,
      email,
    };

    const tokens = await this._getTokens(payload);

    const { refreshToken, accessToken } = tokens;

    const newUser = {
      ...createAuthDto,
      password: passwordHash,
      refreshToken,
    };

    this.usersService.create(newUser);
    return {
      user: newUser,
      accessToken,
      refreshToken,
    };
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    //Затычка линтинга
    console.log(updateAuthDto);
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}

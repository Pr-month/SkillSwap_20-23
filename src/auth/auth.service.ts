import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

export class getTokensDTO {
  username: string;
  userId: string;
  userEmail: string;
  userRole: string;
}

export class returnGetTokensDTO {
  accessToken: string;
  refreshToken: string;
}

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

  async create(createAuthDto: CreateAuthDto) {

    const { name, email, password  } = createAuthDto;

    const saltRound = 10;

    const passwordHash: string = await bcrypt.hash(password, saltRound);

    try {
      const id: string = uuidv4();

      const payload: getTokensDTO = {
        username: name,
        userEmail: email,
        userRole: 'USER',
        userId: id,
      }
      const tokens = await this.getTokens(payload);
      const { refreshToken } = tokens;
      const newUser = {
        ...createAuthDto,
        password: passwordHash,
        refreshToken
      }

      this.usersService.create(newUser)
      return newUser;
    } catch (err) {
      throw new Error(err);
    }
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

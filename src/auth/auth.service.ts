import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';
import { JwtPayload } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Role } from '../common/types';
import { IJwtConfig } from '../config/config.types';
import { Inject } from '@nestjs/common';
import { jwtConfig } from '../config/jwt.config';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private userService: UsersService,
    private jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtSettings: IJwtConfig,
  ) {}

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(
      registerDto.password,
      this.jwtSettings.hashSaltRounds,
    );

    const { wantToLearn, ...userData } = registerDto;

    let wantToLearnCategories: Category[];
    if (wantToLearn) {
      wantToLearnCategories = await Promise.all(
        wantToLearn.map(async (catId) => {
          const foundRepository = await this.categoryRepository.findOne({
            where: { id: catId },
          });
          if (!foundRepository) {
            throw new BadRequestException('Категория не была найдена');
          }
          return foundRepository;
        }),
      );
    } else {
      wantToLearnCategories = [];
    }

    const user = this.userRepository.create({
      ...userData,
      wantToLearn: wantToLearnCategories,
      password: hashedPassword,
    });

    const tokens = await this._getTokens(user);

    const hashedRefreshToken = await bcrypt.hash(
      tokens.refreshToken,
      this.jwtSettings.hashSaltRounds,
    );
    await this.userRepository.save({
      ...user,
      refreshToken: hashedRefreshToken,
    });

    return {
      user: this.excludePasswordAndRefreshToken(user),
      tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email credentials!');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password credentials!');
    }

    const tokens = await this._getTokens(user);

    const hashedRefreshToken = await bcrypt.hash(
      tokens.refreshToken,
      this.jwtSettings.hashSaltRounds,
    );
    await this.userRepository.update(user.id, {
      refreshToken: hashedRefreshToken,
    });

    return {
      user: this.excludePasswordAndRefreshToken(user),
      tokens,
    };
  }

  async refresh(userPayload: JwtPayload) {
    const user = await this.userRepository.findOne({
      where: { id: userPayload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('Access denied!');
    }

    const tokens = await this._getTokens(user);

    if (!user.refreshToken) {
      throw new UnauthorizedException('Access denied!');
    }

    const isRefreshTokenValid = await bcrypt.compare(
      tokens.refreshToken,
      user.refreshToken,
    );

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Access denied!');
    }

    const hashedRefreshToken = await bcrypt.hash(
      tokens.refreshToken,
      this.jwtSettings.hashSaltRounds,
    );

    // Заменил это
    // await this.userService.updateUserById(user.id, {
    //   ...user,
    //   refreshToken: hashedRefreshToken,
    // });
    // на это \/\/\/ т.к. нет смысла вызывать userSevice,
    // когда все остальные функции в auth.service вызывают userRepository
    await this.userRepository.update(user.id, {
      refreshToken: hashedRefreshToken,
    });

    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.userRepository.update(userId, { refreshToken: null });
  }

  private excludePasswordAndRefreshToken(
    user: User,
  ): Omit<User, 'password' | 'refreshToken'> {
    const { password, refreshToken, ...userWithoutSensitiveData } = user;
    void password;
    void refreshToken;
    return userWithoutSensitiveData;
  }

  async _getTokens(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role || Role.USER,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.jwtSettings.accessSecret,
      expiresIn: this.jwtSettings.accessExpiration,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.jwtSettings.refreshSecret,
      expiresIn: this.jwtSettings.refreshExpiration,
    });

    return { accessToken, refreshToken };
  }
}

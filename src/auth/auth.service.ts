import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtPayload } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Role } from 'src/common/types';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists!');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
    });

    const tokens = await this._getTokens(user);

    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
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

    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
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

    const isRefreshTokenValid = await bcrypt.compare(
      tokens.refreshToken,
      user.refreshToken,
    );

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Access denied!');
    }

    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);

    await this.userService.updateUserById(user.id, {
      ...user,
      refreshToken: hashedRefreshToken,
    });

    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.userRepository.update(userId, { refreshToken: '' });
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
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION') || '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRATION'),
    });
    
    return { accessToken, refreshToken };
  }
}

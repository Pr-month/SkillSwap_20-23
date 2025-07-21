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

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists!');
    }

    // Hash password
    const hashedPassword = await hash(registerDto.password, 10);

    // Create user
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Save refresh token
    const hashedRefreshToken = await hash(tokens.refreshToken, 10);
    await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);

    return {
      user: this.excludePasswordAndRefreshToken(user),
      tokens,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    // Find user
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials!');
    }

    // Check password
    const isPasswordValid = await compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials!');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Save refresh token
    const hashedRefreshToken = await hash(tokens.refreshToken, 10);
    await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);

    return {
      user: this.excludePasswordAndRefreshToken(user),
      tokens,
    };
  }

  async refresh(userId: number, refreshToken: string): Promise<AuthTokens> {
    // Find user
    const user = await this.usersService.findOne(userId);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied!');
    }

    // Verify refresh token
    const isRefreshTokenValid = await compare(refreshToken, user.refreshToken);
    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Access denied!');
    }

    // Generate new tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Save new refresh token
    const hashedRefreshToken = await hash(tokens.refreshToken, 10);
    await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);

    return tokens;
  }

  async logout(userId: number): Promise<void> {
    await this.usersService.updateRefreshToken(userId, '');
  }

  private async generateTokens(
    userId: number,
    email: string,
    role: string,
  ): Promise<AuthTokens> {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRATION') || '1h',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn:
          this.configService.get<string>('REFRESH_TOKEN_EXPIRATION') || '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private excludePasswordAndRefreshToken(
    user: User,
  ): Omit<User, 'password' | 'refreshToken'> {
    const { password, refreshToken, ...userWithoutSensitiveData } = user;
    // Variables are intentionally unused - they're extracted to exclude them from the result
    void password;
    void refreshToken;
    return userWithoutSensitiveData;
  }

  // Legacy methods for compatibility - can be removed later
  create(createAuthDto: any) {
    console.log(createAuthDto);
    return 'This action adds a new auth';
  }

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

  async signIn(userData: signInDto): Promise<returnSignInDto> {
    const user = await this.userRepository.findUserByMail(userData.email);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

  update(id: number, updateAuthDto: any) {
    console.log(updateAuthDto);
    return `This action updates a #${id} auth`;
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
    const newUser = await this.userRepository.updateRefreshToken(
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

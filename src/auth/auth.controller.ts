import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthenticatedRequest } from './auth.types';
import {
  LoginResponseDto,
  LogoutResponseDto,
  RegisterResponseDto,
  TokensDto,
} from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { returnErrorDTO } from './dto/returnErrorDTO';
import { AccessTokenGuard } from './guards/access-token.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Регистрация нового пользователя',
    description:
      'Создает нового пользователя в системе и возвращает токены аутентификации',
  })
  @ApiBody({
    type: RegisterDto,
    description: 'Данные для регистрации пользователя',
  })
  @ApiResponse({
    status: 201,
    description: 'Пользователь успешно зарегистрирован',
    type: RegisterResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Некорректные данные регистрации',
    type: returnErrorDTO,
  })
  @ApiResponse({
    status: 409,
    description: 'Пользователь с таким email уже существует',
    type: returnErrorDTO,
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Вход в систему',
    description: 'Аутентификация пользователя по email и паролю',
  })
  @ApiBody({
    type: LoginDto,
    description: 'Данные для входа в систему',
  })
  @ApiResponse({
    status: 200,
    description: 'Успешная аутентификация',
    type: LoginResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Неверные учетные данные',
    type: returnErrorDTO,
  })
  @ApiBadRequestResponse({
    description: 'Некорректные данные входа',
    type: returnErrorDTO,
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Обновление токенов',
    description:
      'Обновляет access и refresh токены используя действующий refresh токен',
  })
  @ApiResponse({
    status: 200,
    description: 'Токены успешно обновлены',
    type: TokensDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Недействительный refresh токен',
    type: returnErrorDTO,
  })
  async refresh(@Request() req: AuthenticatedRequest) {
    return this.authService.refresh(req.user);
  }

  @Post('logout')
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Выход из системы',
    description: 'Завершает сессию пользователя и аннулирует refresh токен',
  })
  @ApiResponse({
    status: 200,
    description: 'Успешный выход из системы',
    type: LogoutResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Недействительный access токен',
    type: returnErrorDTO,
  })
  async logout(@Request() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    await this.authService.logout(userId);
    return { message: 'Logged out successfully!' };
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';

export class TokensDto {
  @ApiProperty({
    description: 'Access токен для аутентификации запросов',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh токен для обновления access токена',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'Данные пользователя без конфиденциальной информации',
    type: User,
  })
  user: Omit<User, 'password' | 'refreshToken'>;

  @ApiProperty({
    description: 'Токены аутентификации',
    type: TokensDto,
  })
  tokens: TokensDto;
}

export class LoginResponseDto extends AuthResponseDto {}

export class RegisterResponseDto extends AuthResponseDto {}

export class LogoutResponseDto {
  @ApiProperty({
    description: 'Сообщение об успешном выходе',
    example: 'Logged out successfully!',
  })
  message: string;
}

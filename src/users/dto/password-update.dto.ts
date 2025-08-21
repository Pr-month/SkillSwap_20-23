import { IsString, MinLength, NotEquals } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
  @ApiProperty({
    description: 'Текущий пароль',
    example: 'currentPassword123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @NotEquals('password')
  currentPassword: string;

  @ApiProperty({
    description: 'Новый пароль (должен отличаться от текущего)',
    example: 'newPassword123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @NotEquals('password')
  newPassword: string;
}

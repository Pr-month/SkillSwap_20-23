import { IsString, MinLength, NotEquals } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  @MinLength(8)
  @NotEquals('password')
  currentPassword: string;

  @IsString()
  @MinLength(8)
  @NotEquals('password')
  newPassword: string;
}

import { IsEmail, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Min(8)
  password: string;

  @IsNotEmpty()
  @IsString()
  name: string;
}

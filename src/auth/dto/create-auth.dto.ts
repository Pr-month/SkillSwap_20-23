import { IsDate, IsEmail, IsNotEmpty, IsString, Min } from 'class-validator';
import { Gender, Role } from 'src/common/types';

export class CreateAuthDto {
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

  @IsNotEmpty()
  @IsDate()
  date: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  gender: Gender;

  @IsString()
  role: Role;
}

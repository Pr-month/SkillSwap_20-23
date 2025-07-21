import { Gender } from '../entities/user.entity';
import { IsEmail, IsNumber, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  name: string;
  @IsEmail()
  email: string;
  @IsNumber()
  age: number;
  @IsString()
  city: string;
  @IsString()
  about: string;
  @IsString()
  gender: Gender;
  @IsString()
  avatar: string;
}

export interface RequestWithGuard extends Request {
  user: {
    userId: string; //ID пользователя
    email: string; //Email пользователя
    roles: string[]; //Роли пользователя
  };
}

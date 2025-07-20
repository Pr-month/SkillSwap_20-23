import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { Gender } from '../entities/user.entity';

// еще должна быть about секция...
export class UpdateUserDto extends PartialType(CreateUserDto) {
  name: string;
  email: string;
  age: number;
  city: string;
  about: string;
  gender: Gender;
  avatar: string;
}

export interface RequestWithGuard extends Request {
  user: {
    userId: string; //ID пользователя
    email: string; //Email пользователя
    roles: string[]; //Роли пользователя
  };
}

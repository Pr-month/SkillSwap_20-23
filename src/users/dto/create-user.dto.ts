import { Gender } from 'src/common/gender.enum';
import { Role } from 'src/common/role.enum';

export class CreateUserDto {
  id: number;
  name: string;
  email: string;
  password: string;
  age: number;
  city: string;
  gender: Gender;
  avatar: string;
  role: Role;
  refreshToken: string;
}

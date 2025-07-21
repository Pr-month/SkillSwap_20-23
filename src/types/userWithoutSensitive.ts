import { Gender } from 'src/common/gender.enum';
import { Role } from 'src/common/role.enum';

export interface IUserWithoutSensitive {
  id: string;
  name: string;
  email: string;
  age: number;
  city: string;
  gender: Gender;
  avatar: string;
  about: string | null;
  role: Role;
}

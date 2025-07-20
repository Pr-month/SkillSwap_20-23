import { User } from '../../users/entities/user.entity';

export class signInDto {
  email: string;
  password: string;
}

export class returnSignInDto {
  user: User;
  accessToken: string;
  refreshToken: string;
}

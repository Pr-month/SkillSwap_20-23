// import { IsNotEmpty, IsString } from 'class-validator';
import { User } from 'src/usersMock/usersMock.service';

export class signInDto {
  username: string;
  password: string;
}

export class returnSignInDto {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export class returnErrorDTO {
  error: string;
}

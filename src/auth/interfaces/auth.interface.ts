import { User } from '../../users/entities/user.entity';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: Omit<User, 'password' | 'refreshToken'>;
  tokens: AuthTokens;
}

export interface RequestWithUser {
  user: User & { refreshToken: string };
}

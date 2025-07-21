import { Role } from 'src/common/types';

export interface JwtPayload {
  userId: string;
  userEmail: string;
  userRole: Role | undefined;
}

export interface returnJwtToken {
  accessToken: string;
  refreshToken: string;
}

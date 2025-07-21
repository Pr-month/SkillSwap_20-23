export class getTokensDTO {
  username: string;
  userId: string;
  userEmail: string;
  userRole: string;
}

export class returnGetTokensDTO {
  accessToken: string;
  refreshToken: string;
}

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../auth.types';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    // Явно типизируем вызов ExtractJwt
    const jwtExtractor = ExtractJwt.fromAuthHeaderAsBearerToken();
    const jwtFromRequest = (req: any) => {
      try {
        return jwtExtractor(req);
      } catch (err) {
        return null;
      }
    };

    super({
      jwtFromRequest,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'defaultSecretKey',
      ignoreExpiration: false,
    });
  }

  validate(payload: JwtPayload) {
    return {
      userId: payload.sub,
      email: payload.email,
      roles: payload.roles,
    };
  }
}
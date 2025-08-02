import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { JwtPayload } from '../auth.types';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { IJwtConfig } from '../../config/config.types';
import { Inject } from '@nestjs/common';
import { jwtConfig } from '../../config/jwt.config';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    @Inject(jwtConfig.KEY)
    private readonly jwtSettings: IJwtConfig,) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:jwtSettings.refreshSecret,
      passReqToCallback: true,
    });
  }

  validate(payload: JwtPayload) {
    return payload;
  }
}

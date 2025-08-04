import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { SocketWithUser } from './types';
import { WsException } from '@nestjs/websockets';
import { JwtPayload } from 'src/auth/auth.types';
import { IJwtConfig } from 'src/config/config.types';

@Injectable()
export class JwtWsGuard {
  constructor(
    private jwtService: JwtService,
    @Inject('APP_CONFIG')
    private readonly configService: ConfigService,
  ) {}

  verify(client: Socket): SocketWithUser {
    const jwtConfig = this.configService.get<IJwtConfig>('JWT');
    const token = client.handshake.query?.token;

    if (!token) {
      throw new WsException('Token is required');
    }

    if (Array.isArray(token)) {
      throw new WsException('Token must not be an array!');
    }

    try {
      const user: JwtPayload = this.jwtService.verify(token, {
        secret: jwtConfig?.accessSecret || 'superSecretValue',
      });
      (client as SocketWithUser).data = {
        user,
      };

      return client as SocketWithUser;
    } catch (error) {
      console.log(error);
      throw new WsException('Invalid token');
    }
  }
}

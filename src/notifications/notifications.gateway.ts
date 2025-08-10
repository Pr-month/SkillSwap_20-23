import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayDisconnect,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { NotificationsService } from './notifications.service';
import { JwtWsGuard } from './guards/ws-jwt.guard';
import { SocketWithUser } from './guards/types';
import { Server } from 'socket.io';
import { OnModuleInit } from '@nestjs/common';

@WebSocketGateway(Number(process.env.WS_PORT) || Number(process.env.PORT), {
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly jwtGuard: JwtWsGuard,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: SocketWithUser) {
    try {
      this.jwtGuard.verify(client);
      await client.join(client.data.user.sub);
      console.log('Client joined room:', client.data.user.sub);
      return client;
    } catch (error) {
      client.disconnect();
      throw error;
    }
  }

  async handleDisconnect(client: SocketWithUser) {
    await client.leave(client.data.user.sub);
    console.log('Client left room:', client.id);
  }

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log(socket.id);
      console.log('Connected!');
    });
  }

  afterInit(server: Server) {
    this.notificationsService.socket = server;
  }
}

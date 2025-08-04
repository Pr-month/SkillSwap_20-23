import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayDisconnect,
  OnGatewayConnection,
  MessageBody,
} from '@nestjs/websockets';
import { NotificationsService } from './notifications.service';
import { JwtWsGuard } from './guards/ws-jwt.guard';
import { notificationPayload, SocketWithUser } from './guards/types';

@WebSocketGateway()
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly jwtGuard: JwtWsGuard,
  ) {}

  @WebSocketServer()
  server: any;

  @SubscribeMessage('Message')
  onNewMessage(@MessageBody() body: any) {
    console.log(body);
  }

  async handleConnection(client: SocketWithUser) {
    try {
      this.jwtGuard.verify(client);
      await client.join(client.id);
      console.log('Client connected:', client.data.user);
    } catch (error) {
      client.disconnect();
      throw error;
    }
  }

  async handleDisconnect(client: SocketWithUser) {
    await client.leave(client.id);
    console.log('Client disconnected:', client.id);
  }

  notifyUser(id: string, client: SocketWithUser, payload: notificationPayload) {
    const payloadMessage = `${payload.type}\n Поступило уведомление от ${payload.sender} о навыке ${payload.skillTitle}!`;
    client.to(id).emit('notificateNewRequest', payloadMessage);
  }

  @SubscribeMessage('msgToServer')
  handleMessage(client: SocketWithUser, payload: string): string {
    return 'Message received: ' + payload;
  }
}

// TO DO
// При создании заказа отправляем уведомление:
// this.requestsGateway.notifyNewRequest(id владельца навыка, `Поступила новая заявка от ${отправитель}`);

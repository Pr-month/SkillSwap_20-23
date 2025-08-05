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
import {
  notificationPayload,
  sendMessageToUserPayload,
  SocketWithUser,
} from './guards/types';
import { Server } from 'socket.io';
import { OnModuleInit } from '@nestjs/common';

@WebSocketGateway()
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

  notifyNewRequest(client: any, payload: notificationPayload) {
    const payloadMessage = `${payload.type}\n Поступило уведомление для ${payload.reciever} от ${payload.sender} о навыке ${payload.skillTitle}!`;
    this.server
      .to(payload.reciever)
      .emit('notificateNewRequest', payloadMessage);
  }

  notifyNewMessage(client: any, payload: sendMessageToUserPayload) {
    const payloadMessage = `Поступило письмо для ${payload.reciever} от ${payload.sender}\n${payload.text}!`;
    this.server.to(payload.reciever).emit('sendMessageToUser', payloadMessage);
  }

  @SubscribeMessage('msgToServer')
  handleMessage(client: SocketWithUser, payload: string): string {
    return 'Message received: ' + payload;
  }

  @SubscribeMessage('testNotifications')
  onNewNotification(client: any, @MessageBody() body: any) {
    // This here is for testing the functionality of notifications
    console.log(body);
    this.notifyNewRequest(client, {
      type: 'Message',
      skillTitle: 'Web Sockets and JWT guards',
      sender: '0354a762-8928-427f-81d7-1656f717f39c', // Большого значения это не имеет
      reciever: '0354a762-8928-427f-81d7-1656f717f39c', // Для теста сюда нужно задать user.ID пользователя
    });
  }

  @SubscribeMessage('sendMessageToUser')
  onNewMessage(client: any, @MessageBody() body: any) {
    // This here is for testing the functionality of new messages
    console.log(body);
    this.notifyNewMessage(client, {
      text: String(body),
      sender: '0354a762-8928-427f-81d7-1656f717f39c', // Большого значения это не имеет
      reciever: '0354a762-8928-427f-81d7-1656f717f39c', // Для теста сюда нужно задать user.ID пользователя
    });
  }
}

// TO DO
// При создании заказа отправляем уведомление:
// this.requestsGateway.notifyNewRequest(id владельца навыка, `Поступила новая заявка от ${отправитель}`);

import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { ReqStatus } from 'src/common/requests-status.enum';
import { Request } from 'src/requests/entities/request.entity';
import { sendMessageToUserPayload } from './guards/types';

@Injectable()
export class NotificationsService {
  public socket: Server;

  notifyNewRequest(request: Request) {
    const notificationMessage = `Пользователь ${request.sender.name} предлагает обмен навыка ${request.requestedSkill.title} на ${request.offeredSkill.title} с вами, ${request.receiver.name}!`;
    this.socket
      .to(request.receiver.id)
      .emit('notifyRequest', notificationMessage);
  }

  notifyUpdateRequest(request: Request) {
    let notificationMessage: string =
      'Мы хотели вам что-то сообщить, но что-то пошло не так...';
    switch (request.status) {
      case ReqStatus.ACCEPTED:
        notificationMessage = `Пользователь ${request.receiver.name} согласился обменятся навыком ${request.requestedSkill.title} на ${request.offeredSkill.title} с вами, ${request.sender.name}!`;
        break;

      case ReqStatus.REJECTED:
        notificationMessage = `К сожалению, пользователь ${request.receiver.name} отказался обменятся навыком ${request.requestedSkill.title} на ${request.offeredSkill.title} с вами, ${request.sender.name}!`;
        break;

      default:
        notificationMessage =
          'Мы хотели вам что-то сообщить, но что-то пошло не так...';
        break;
    }
    this.socket
      .to(request.sender.id)
      .emit('notifyRequest', notificationMessage);
  }

  notifyNewMessage(client: any, payload: sendMessageToUserPayload) {
    const payloadMessage = `Поступило письмо для ${payload.reciever} от ${payload.sender}\n${payload.text}!`;
    this.socket.to(payload.reciever).emit('sendMessageToUser', payloadMessage);
  }
}

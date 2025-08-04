import { JwtPayload } from 'src/auth/auth.types';
import { Socket } from 'socket.io';

export interface SocketWithUser extends Socket {
  data: {
    user: JwtPayload;
  };
}

export class notificationPayload {
  type: string;
  skillTitle: string;
  sender: string;
  reciever: string;
}

export class sendMessageToUserPayload {
  text: string;
  sender: string;
  reciever: string;
}

import { Global, Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { JwtWsGuard } from './guards/ws-jwt.guard';

@Global()
@Module({
  providers: [NotificationsGateway, NotificationsService, JwtWsGuard],
  exports: [NotificationsService],
})
export class NotificationsModule {}

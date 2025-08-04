import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { JwtWsGuard } from './guards/ws-jwt.guard';

@Module({
  providers: [NotificationsGateway, NotificationsService, JwtWsGuard],
})
export class NotificationsModule {}

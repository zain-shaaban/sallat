import { Module } from '@nestjs/common';
import { NotificationSocketGateway } from './notification-socket.gateway';

@Module({
  providers: [NotificationSocketGateway],
})
export class NotificationSocketModule {}

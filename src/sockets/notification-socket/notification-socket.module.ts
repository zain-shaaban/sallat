import { Module } from '@nestjs/common';
import { NotificationSocketGateway } from './notification-socket.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationSocket } from './entites/notification-socket.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationSocket])],
  providers: [NotificationSocketGateway],
})
export class NotificationSocketModule {}

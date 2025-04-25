import { Module } from '@nestjs/common';
import { SocketNotificationService } from './socket-notification.service';
import { SocketNotificationController } from './socket-notification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocketNotification } from './entities/socket-notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SocketNotification])],
  controllers: [SocketNotificationController],
  providers: [SocketNotificationService],
})
export class SocketNotificationModule {}

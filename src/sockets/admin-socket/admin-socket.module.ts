import { Module, forwardRef } from '@nestjs/common';
import { AdminSocketGateway } from './admin-socket.gateway';
import { DriverSocketModule } from '../driver-sokcet/driver-sokcet.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocketNotification } from 'src/socket-notification/entities/socket-notification.entity';

@Module({
  imports: [forwardRef(() => DriverSocketModule), TypeOrmModule.forFeature([SocketNotification])],
  providers: [AdminSocketGateway],
  exports: [AdminSocketGateway],
})
export class AdminSocketModule {}

import { Module, forwardRef } from '@nestjs/common';
import { AdminSocketGateway } from './admin-socket.gateway';
import { DriverSocketModule } from '../driver-sokcet/driver-sokcet.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationSocket } from '../notification-socket/entites/notification-socket.entity';

@Module({
  imports: [
    forwardRef(() => DriverSocketModule),
    TypeOrmModule.forFeature([NotificationSocket]),
  ],
  providers: [AdminSocketGateway],
  exports: [AdminSocketGateway],
})
export class AdminSocketModule {}

import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriverSocketGateway } from './driver/driver.gateway';
import { NotificationSocketGateway } from './notifications/notification.gateway';
import { AdminSocketGateway } from './admin/admin.gateway';
import { NotificationSocket } from './notifications/entites/notification-socket.entity';
import { Trip } from 'src/trip/entities/trip.entity';
import { Vendor } from 'src/vendor/entities/vendor.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { AdminService } from './admin/admin.service';
import { DriverService } from './driver/driver.service';
import { TripModule } from 'src/trip/trip.module';
import { WsAuthMiddleware } from 'src/common/middlewares/ws-auth.middleware';

@Module({
  imports: [
    forwardRef(() => TripModule),
    TypeOrmModule.forFeature([NotificationSocket, Trip, Vendor, Customer]),
  ],
  providers: [
    WsAuthMiddleware,
    AdminSocketGateway,
    DriverSocketGateway,
    NotificationSocketGateway,
    AdminService,
    DriverService,
  ],
  exports: [AdminService, DriverService],
})
export class SocketsModule {}

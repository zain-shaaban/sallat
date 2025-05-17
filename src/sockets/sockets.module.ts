import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriverSocketGateway } from './driver/driver.gateway';
import { NotificationSocketGateway } from './notifications/notification.gateway';
import { AdminSocketGateway } from './admin/admin.gateway';
import { NotificationSocket } from './notifications/entites/notification-socket.entity';
import { Trip } from 'src/trip/entities/trip.entity';
import { Vendor } from 'src/vendor/entities/vendor.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { LocationEntity } from 'src/trip/entities/location.entity';
import { AdminService } from './admin/admin.service';
import { DriverService } from './driver/driver.service';
import { TripModule } from 'src/trip/trip.module';

@Module({
  imports: [
    forwardRef(()=>TripModule),
    //forwardRef(() => TripModule),
    TypeOrmModule.forFeature([
      NotificationSocket,
      Trip,
      Vendor,
      Customer,
      LocationEntity,
    ]),
  ],
  providers: [
    AdminSocketGateway,
    DriverSocketGateway,
    NotificationSocketGateway,
    AdminService,
    DriverService,
  ],
  exports: [AdminService, DriverService],
})
export class SocketsModule {}

import { Module, forwardRef } from '@nestjs/common';
import { DriverSocketGateway } from './driver-sokcet.gateway';
import { AdminSocketModule } from '../admin-socket/admin-socket.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trip } from 'src/trip/entities/trip.entity';
import { Vendor } from 'src/vendor/entities/vendor.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { LocationEntity } from 'src/trip/entities/location.entity';
import { SocketNotification } from 'src/socket-notification/entities/socket-notification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Trip, Vendor, Customer, LocationEntity, SocketNotification]),
    forwardRef(() => AdminSocketModule),
  ],
  providers: [DriverSocketGateway],
  exports: [DriverSocketGateway],
})
export class DriverSocketModule {}

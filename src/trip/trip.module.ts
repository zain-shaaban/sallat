import { forwardRef, Module } from '@nestjs/common';
import { TripService } from './trip.service';
import { TripController } from './trip.controller';
import { Trip } from './entities/trip.entity';
import { AdminSocketModule } from 'src/sockets/admin-socket/admin-socket.module';
import { DriverSocketModule } from 'src/sockets/driver-sokcet/driver-sokcet.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from 'src/customer/entities/customer.entity';
import { Vendor } from 'src/vendor/entities/vendor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Trip, Customer, Vendor]),
    forwardRef(() => AdminSocketModule),
    forwardRef(() => DriverSocketModule),
  ],
  controllers: [TripController],
  providers: [TripService],
})
export class TripModule {}

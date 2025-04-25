import { forwardRef, Module } from '@nestjs/common';
import { TripService } from './trip.service';
import { TripController } from './trip.controller';
import { Trip } from './entities/trip.entity';
import { AdminSocketModule } from 'src/sockets/admin-socket/admin-socket.module';
import { DriverSocketModule } from 'src/sockets/driver-sokcet/driver-sokcet.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from 'src/customer/entities/customer.entity';
import { LocationEntity } from './entities/location.entity';
import { CustomerModule } from 'src/customer/customer.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Trip, Customer, LocationEntity]),
    forwardRef(() => AdminSocketModule),
    forwardRef(() => DriverSocketModule),
    forwardRef(() => CustomerModule),
  ],
  controllers: [TripController],
  providers: [TripService],
})
export class TripModule {}

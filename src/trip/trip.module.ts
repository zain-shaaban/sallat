import { Module } from '@nestjs/common';
import { TripService } from './trip.service';
import { TripController } from './trip.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Trip } from './entities/trip.entity';
import { Customer } from './entities/customer.entity';
import { VendorOrder } from './entities/vendor-order.entity';

@Module({
  imports:[SequelizeModule.forFeature([Trip,Customer,VendorOrder])],
  controllers: [TripController],
  providers: [TripService],
})
export class TripModule {}

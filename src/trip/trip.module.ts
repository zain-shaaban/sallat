import { Module } from '@nestjs/common';
import { TripService } from './trip.service';
import { TripController } from './trip.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Trip } from './entities/trip.entity';
import { VendorOrder } from './entities/vendor-order.entity';
import { CustomerModule } from 'src/customer/customer.module';

@Module({
  imports:[SequelizeModule.forFeature([Trip,VendorOrder]),CustomerModule],
  controllers: [TripController],
  providers: [TripService],
  exports:[SequelizeModule.forFeature([Trip])]
})
export class TripModule {}

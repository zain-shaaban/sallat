import { forwardRef, Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Customer } from './entities/customer.entity';
import { TripModule } from 'src/trip/trip.module';

@Module({
  imports: [SequelizeModule.forFeature([Customer]),forwardRef(()=>TripModule)],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [SequelizeModule.forFeature([Customer])],
})
export class CustomerModule {}

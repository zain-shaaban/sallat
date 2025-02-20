import { forwardRef, Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Customer } from './entities/customer.entity';
import { TripModule } from 'src/trip/trip.module';
import { AdminSocketModule } from 'src/sockets/admin-socket/admin-socket.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Customer]),
    forwardRef(() => TripModule),
    AdminSocketModule,
  ],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [SequelizeModule.forFeature([Customer])],
})
export class CustomerModule {}

import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { Customer } from './entities/customer.entity';
import { AdminSocketModule } from 'src/sockets/admin-socket/admin-socket.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trip } from 'src/trip/entities/trip.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Trip]), AdminSocketModule],
  controllers: [CustomerController],
  providers: [CustomerService],
})
export class CustomerModule {}

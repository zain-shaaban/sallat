import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { Customer } from './entities/customer.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trip } from 'src/trip/entities/trip.entity';
import { SocketsModule } from 'src/sockets/sockets.module';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Trip]), SocketsModule],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}

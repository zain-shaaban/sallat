import {  Module } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { VendorController } from './vendor.controller';
import { Vendor } from './entities/vendor.entity';
import { AdminSocketModule } from 'src/sockets/admin-socket/admin-socket.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trip } from 'src/trip/entities/trip.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vendor]), AdminSocketModule],
  controllers: [VendorController],
  providers: [VendorService],
})
export class VendorModule {}

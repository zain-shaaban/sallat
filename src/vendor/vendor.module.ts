import {  Module } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { VendorController } from './vendor.controller';
import { Vendor } from './entities/vendor.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocketsModule } from 'src/sockets/sockets.module';
import { Trip } from 'src/trip/entities/trip.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vendor,Trip]), SocketsModule],
  controllers: [VendorController],
  providers: [VendorService],
})
export class VendorModule {}

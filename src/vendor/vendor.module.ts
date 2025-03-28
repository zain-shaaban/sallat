import { forwardRef, Module } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { VendorController } from './vendor.controller';
import { Vendor } from './entities/vendor.entity';
import { TripModule } from 'src/trip/trip.module';
import { AdminSocketModule } from 'src/sockets/admin-socket/admin-socket.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trip } from 'src/trip/entities/trip.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vendor, Trip]), AdminSocketModule],
  controllers: [VendorController],
  providers: [VendorService],
})
export class VendorModule {}

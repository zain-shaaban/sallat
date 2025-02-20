import { forwardRef, Module } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { VendorController } from './vendor.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Vendor } from './entities/vendor.entity';
import { TripModule } from 'src/trip/trip.module';
import { AdminSocketModule } from 'src/sockets/admin-socket/admin-socket.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Vendor]),
    forwardRef(() => TripModule),
    AdminSocketModule,
  ],
  controllers: [VendorController],
  providers: [VendorService],
  exports: [SequelizeModule.forFeature([Vendor])],
})
export class VendorModule {}

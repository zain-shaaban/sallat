import { forwardRef, Module } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { VendorController } from './vendor.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Vendor } from './entities/vendor.entity';
import { TripModule } from 'src/trip/trip.module';

@Module({
  imports: [SequelizeModule.forFeature([Vendor]),forwardRef(()=>TripModule)],
  controllers: [VendorController],
  providers: [VendorService],
  exports: [SequelizeModule.forFeature([Vendor])],
})
export class VendorModule {}

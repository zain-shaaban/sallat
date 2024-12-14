import { Module } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { VendorController } from './vendor.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Vendor } from './entities/vendor.entity';

@Module({
  imports: [SequelizeModule.forFeature([Vendor])],
  controllers: [VendorController],
  providers: [VendorService],
})
export class VendorModule {}

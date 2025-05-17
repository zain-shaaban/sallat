import {  Module } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { VendorController } from './vendor.controller';
import { Vendor } from './entities/vendor.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocketsModule } from 'src/sockets/sockets.module';

@Module({
  imports: [TypeOrmModule.forFeature([Vendor]), SocketsModule],
  controllers: [VendorController],
  providers: [VendorService],
})
export class VendorModule {}

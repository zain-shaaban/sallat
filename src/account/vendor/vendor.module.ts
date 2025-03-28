import { Global, Module } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { VendorController } from './vendor.controller';
import { AdminSocketModule } from 'src/sockets/admin-socket/admin-socket.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vendor } from 'src/vendor/entities/vendor.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Vendor]), AdminSocketModule],
  controllers: [VendorController],
  providers: [VendorService],
})
export class AccountVendorModule {}

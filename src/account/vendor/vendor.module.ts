import { Global, Module } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { VendorController } from './vendor.controller';
import { VendorModule } from 'src/vendor/vendor.module';
import { AdminSocketModule } from 'src/sockets/admin-socket/admin-socket.module';

@Global()
@Module({
  imports: [VendorModule,AdminSocketModule],
  controllers: [VendorController],
  providers: [VendorService],
  exports:[VendorModule]
})
export class AccountVendorModule {}

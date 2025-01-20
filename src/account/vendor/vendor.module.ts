import { Global, Module } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { VendorController } from './vendor.controller';
import { VendorModule } from 'src/vendor/vendor.module';

@Global()
@Module({
  imports: [VendorModule],
  controllers: [VendorController],
  providers: [VendorService],
  exports:[VendorModule]
})
export class AccountVendorModule {}

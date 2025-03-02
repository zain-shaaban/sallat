import { forwardRef, Global, Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { DriverModule } from 'src/account/driver/driver.module';

@Global()
@Module({
  imports: [forwardRef(()=>DriverModule)],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports:[NotificationService]
})
export class NotificationModule {}

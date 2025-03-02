import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { DriverModule } from 'src/account/driver/driver.module';

@Module({
  imports: [DriverModule],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}

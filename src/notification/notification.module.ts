import { Global, Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriverMetadata } from 'src/account/entities/driverMetadata.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([DriverMetadata])],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}

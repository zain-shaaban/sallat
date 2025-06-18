import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriverSocketGateway } from './driver/driver.gateway';
import { LogGateway } from './logs/logs.gateway';
import { AdminSocketGateway } from './admin/admin.gateway';
import { Log } from './logs/entites/logs.entity';
import { Trip } from 'src/trip/entities/trip.entity';
import { Vendor } from 'src/vendor/entities/vendor.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { AdminService } from './admin/admin.service';
import { DriverService } from './driver/driver.service';
import { TripModule } from 'src/trip/trip.module';
import { WsAuthMiddleware } from 'src/common/middlewares/ws-auth.middleware';
import { TelegramModule } from 'src/telegram-bot/telegram.module';
import { LogService } from './logs/logs.service';
import { OnlineDriversModule } from './shared-online-drivers/online-drivers.module';

@Module({
  imports: [
    forwardRef(() => TripModule),
    TypeOrmModule.forFeature([Log, Trip, Vendor, Customer]),
    TelegramModule,
    OnlineDriversModule
  ],
  providers: [
    WsAuthMiddleware,
    AdminSocketGateway,
    DriverSocketGateway,
    LogGateway,
    AdminService,
    DriverService,
    LogService,
  ],
  exports: [AdminService,LogService],
})
export class SocketsModule {}

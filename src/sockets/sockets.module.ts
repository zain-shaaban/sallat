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
import { TelegramUserModule } from 'src/telegram-user-bot/telegram-user.module';
import { VendorTrips } from './vendor/vendor-trips.entity';
import { VendorSocketGateway } from './vendor/vendor.gateway';
import { VendorSocketService } from './vendor/vendor.service';

@Module({
  imports: [
    forwardRef(() => TripModule),
    TypeOrmModule.forFeature([Log, Trip, Vendor, Customer,VendorTrips]),
    TelegramModule,
    OnlineDriversModule,
    TelegramUserModule
  ],
  providers: [
    WsAuthMiddleware,
    AdminSocketGateway,
    DriverSocketGateway,
    LogGateway,
    AdminService,
    DriverService,
    LogService,
    VendorSocketGateway,
    VendorSocketService
  ],
  exports: [AdminService,LogService,VendorSocketService],
})
export class SocketsModule {}

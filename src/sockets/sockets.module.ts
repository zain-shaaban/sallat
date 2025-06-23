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
import { PartnerTrips } from './partner/partner.entity';
import { PartnerGateway } from './partner/partner.gateway';
import { PartnerService} from './partner/partner.service';

@Module({
  imports: [
    forwardRef(() => TripModule),
    TypeOrmModule.forFeature([Log, Trip, Vendor, Customer, PartnerTrips]),
    TelegramModule,
    OnlineDriversModule,
    TelegramUserModule,
  ],
  providers: [
    WsAuthMiddleware,
    AdminSocketGateway,
    DriverSocketGateway,
    LogGateway,
    AdminService,
    DriverService,
    LogService,
    PartnerGateway,
    PartnerService,
  ],
  exports: [AdminService, LogService, PartnerService],
})
export class SocketsModule {}

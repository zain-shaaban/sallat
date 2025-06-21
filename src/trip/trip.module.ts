import { forwardRef, Module } from '@nestjs/common';
import { TripService } from './trip.service';
import { TripController } from './trip.controller';
import { Trip } from './entities/trip.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from 'src/customer/entities/customer.entity';
import { CustomerModule } from 'src/customer/customer.module';
import { SocketsModule } from 'src/sockets/sockets.module';
import { OnlineDriversModule } from 'src/sockets/shared-online-drivers/online-drivers.module';
import { TelegramUserModule } from 'src/telegram-user-bot/telegram-user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Trip, Customer]),
    forwardRef(() => SocketsModule),
    forwardRef(() => CustomerModule),
    OnlineDriversModule,
    TelegramUserModule
  ],
  controllers: [TripController],
  providers: [TripService],
  exports: [TripService],
})
export class TripModule {}

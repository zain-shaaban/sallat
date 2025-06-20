import { Module } from '@nestjs/common';
import { TelegramUserService } from './telegram-user.service';
import { TelegramUserUpdate } from './telegram-user.update';
import { TELEGRAF_BOT_NAME } from 'nestjs-telegraf';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from 'src/customer/entities/customer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  providers: [TelegramUserUpdate, {
    provide: TELEGRAF_BOT_NAME,
    useValue: 'user'
  }, TelegramUserService],
  exports: [TelegramUserService],
})
export class TelegramUserModule {}

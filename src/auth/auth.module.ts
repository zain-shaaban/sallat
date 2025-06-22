import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from 'src/account/entities/account.entity';
import { JwtStrategy } from './auth.strategy';
import { LogService } from 'src/sockets/logs/logs.service';
import { Log } from 'src/sockets/logs/entites/logs.entity';
import { TelegramModule } from 'src/telegram-bot/telegram.module';
import { Vendor } from 'src/vendor/entities/vendor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, Log,Vendor]),
    TelegramModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LogService],
  exports: [JwtStrategy],
})
export class AuthModule {}

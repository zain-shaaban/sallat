import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from 'src/account/entities/account.entity';
import { JwtStrategy } from './auth.strategy';
import { LogService } from 'src/sockets/logs/logs.service';
import { Log } from 'src/sockets/logs/entites/logs.entity';
import { TelegramModule } from 'src/telegram-bot/telegram.module';
import { OnlineDriversModule } from 'src/sockets/shared-online-drivers/online-drivers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, Log]),
    TelegramModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LogService],
  exports: [JwtStrategy],
})
export class AuthModule {}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import dbConfig from './config/db.config';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { CategoryModule } from './category/category.module';
import { TripModule } from './trip/trip.module';
import { CustomerModule } from './customer/customer.module';
import { VendorModule } from './vendor/vendor.module';
import { ErrorLoggerModule } from './common/error_logger/error_logger.module';
import { FirebaseModule } from './firebase/firebase.module';
import { NotificationModule } from './notification/notification.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from './account/account.module';
import { SocketsModule } from './sockets/sockets.module';
import { SessionsModule } from './sessions/sessions.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { PassportModule } from '@nestjs/passport';
import { TelegrafModule } from 'nestjs-telegraf';
import { TelegramModule } from './telegram-bot/telegram.module';
import { TelegramUserModule } from './telegram-user-bot/telegram-user.module';

// Delete me - adding comment to push to restart the server
@Module({
  imports: [
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      botName: 'management',
      useFactory: (configService: ConfigService) => ({
        token: configService.get('TELEGRAM_TOKEN'),
        botName: 'management',
        launchOptions:{
          webhook:{
            domain:configService.get<string>('APP_URL')!,
            path:`/telegraf/${configService.get<string>('MANAGEMENT_WEBHOOK_SECRET')}`
          }
        },
        include: [TelegramModule]
      }),
      inject: [ConfigService],
    }),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      botName: 'user',
      useFactory: (configService: ConfigService) => ({
        token: configService.get('USER_TELEGRAM_TOKEN'),
        botName: 'user',
        launchOptions:{
          webhook:{
            domain:configService.get<string>('APP_URL')!,
            path:`/telegraf/${configService.get<string>('USER_WEBHOOK_SECRET')}`
          }
        },
        include: [TelegramUserModule]
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60000, limit: 5 }],
    }),
    ScheduleModule.forRoot(),
    PassportModule,
    ConfigModule.forRoot({ isGlobal: true, load: [dbConfig] }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.user'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        autoLoadEntities: true,
        retryAttempts: 0,
        synchronize: true,
        logging: false,
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      global: true,
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '30d' },
      }),
      inject: [ConfigService],
    }),
    VendorModule,
    AuthModule,
    CategoryModule,
    SocketsModule,
    TripModule,
    CustomerModule,
    ErrorLoggerModule,
    FirebaseModule,
    NotificationModule,
    AccountModule,
    SessionsModule,
    TelegramModule,
    TelegramUserModule
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import dbConfig from './config/db.config';
import { SequelizeModule } from '@nestjs/sequelize';
import { CcModule } from './account/cc/cc.module';
import { ManagerModule } from './account/manager/manager.module';
import { AccountVendorModule } from './account/vendor/vendor.module';
import { DriverModule } from './account/driver/driver.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { CategoryModule } from './category/category.module';
import { DriverSokcetModule } from './sockets/driver-sokcet/driver-sokcet.module';
import { AdminSocketModule } from './sockets/admin-socket/admin-socket.module';
import { PathModule } from './path/path.module';
import { TripModule } from './trip/trip.module';
import { CustomerModule } from './customer/customer.module';
import { VendorModule } from './vendor/vendor.module';
import { NotificationSocketModule } from './sockets/notification-socket/notification-socket.module';
import { ErrorLoggerModule } from './common/error_logger/error_logger.module';
import { FirebaseModule } from './firebase/firebase.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [dbConfig] }),
    SequelizeModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        dialect: 'mysql',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.user'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        autoLoadModels: true,
        retryAttempts: 2,
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
    CcModule,
    ManagerModule,
    VendorModule,
    DriverModule,
    AuthModule,
    CategoryModule,
    DriverSokcetModule,
    AdminSocketModule,
    PathModule,
    TripModule,
    CustomerModule,
    AccountVendorModule,
    NotificationSocketModule,
    ErrorLoggerModule,
    FirebaseModule,
    NotificationModule,
  ],
})
export class AppModule {}

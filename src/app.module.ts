import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import dbConfig from './config/db.config';
import { SequelizeModule } from '@nestjs/sequelize';
import { CcModule } from './account/cc/cc.module';
import { ManagerModule } from './account/manager/manager.module';
import { VendorModule } from './account/vendor/vendor.module';
import { DriverModule } from './account/driver/driver.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { CategoryModule } from './category/category.module';
import { DriverSokcetModule } from './sockets/driver-sokcet/driver-sokcet.module';
import { AdminSocketModule } from './sockets/admin-socket/admin-socket.module';
import { PathModule } from './path/path.module';

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
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import dbConfig from './config/db.config';
import { SequelizeModule } from '@nestjs/sequelize';
import { CcModule } from './account/cc/cc.module';
import { ManagerModule } from './account/manager/manager.module';
import { VendorModule } from './account/vendor/vendor.module';
import { DriverModule } from './account/driver/driver.module';

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
    CcModule,
    ManagerModule,
    VendorModule,
    DriverModule,
  ],
})
export class AppModule {}

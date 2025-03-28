import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cc } from 'src/account/cc/entities/cc.entity';
import { Driver } from 'src/account/driver/entities/driver.entity';
import { Manager } from 'src/account/manager/entities/manager.entity';
import { Vendor } from 'src/vendor/entities/vendor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cc, Driver, Manager, Vendor])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}

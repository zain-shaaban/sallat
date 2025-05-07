import { Global, Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { DriverMetadata } from './entities/driverMetadata.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Account, DriverMetadata])],
  controllers: [AccountController],
  providers: [AccountService],
})
export class AccountModule {}

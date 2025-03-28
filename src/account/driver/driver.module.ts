import { Global, Module } from '@nestjs/common';
import { DriverService } from './driver.service';
import { DriverController } from './driver.controller';
import { Driver } from './entities/driver.entity';
import { AdminSocketModule } from 'src/sockets/admin-socket/admin-socket.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Driver]), AdminSocketModule],
  controllers: [DriverController],
  providers: [DriverService],
})
export class DriverModule {}

import { Global, Module } from '@nestjs/common';
import { DriverService } from './driver.service';
import { DriverController } from './driver.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Driver } from './entities/driver.entity';
import { AdminSocketModule } from 'src/sockets/admin-socket/admin-socket.module';

@Global()
@Module({
  imports: [SequelizeModule.forFeature([Driver]),AdminSocketModule],
  controllers: [DriverController],
  providers: [DriverService],
  exports:[SequelizeModule.forFeature([Driver])]
})
export class DriverModule {}


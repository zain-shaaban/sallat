import { Global, Module } from '@nestjs/common';
import { DriverService } from './driver.service';
import { DriverController } from './driver.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Driver } from './entities/driver.entity';

@Global()
@Module({
  imports: [SequelizeModule.forFeature([Driver])],
  controllers: [DriverController],
  providers: [DriverService],
  exports:[SequelizeModule.forFeature([Driver])]
})
export class DriverModule {}


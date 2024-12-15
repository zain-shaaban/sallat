import { Global, Module } from '@nestjs/common';
import { ManagerService } from './manager.service';
import { ManagerController } from './manager.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Manager } from './entities/manager.entity';

@Global()
@Module({
  imports: [SequelizeModule.forFeature([Manager])],
  controllers: [ManagerController],
  providers: [ManagerService],
  exports:[SequelizeModule.forFeature([Manager])]
})
export class ManagerModule {}

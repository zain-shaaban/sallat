import { Module } from '@nestjs/common';
import { PathService } from './path.service';
import { PathController } from './path.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Path } from './entities/path.entity';

@Module({
  imports:[SequelizeModule.forFeature([Path])],
  controllers: [PathController],
  providers: [PathService],
  exports:[PathService]
})
export class PathModule {}

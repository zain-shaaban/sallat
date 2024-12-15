import { Global, Module } from '@nestjs/common';
import { CcController } from './cc.controller';
import { CcService } from './cc.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Cc } from './entities/cc.entity';

@Global()
@Module({
  imports: [SequelizeModule.forFeature([Cc])],
  controllers: [CcController],
  providers: [CcService],
  exports: [SequelizeModule.forFeature([Cc])],
})
export class CcModule {}

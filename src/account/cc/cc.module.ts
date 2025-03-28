import { Global, Module } from '@nestjs/common';
import { CcController } from './cc.controller';
import { CcService } from './cc.service';
import { Cc } from './entities/cc.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Cc])],
  controllers: [CcController],
  providers: [CcService],
})
export class CcModule {}

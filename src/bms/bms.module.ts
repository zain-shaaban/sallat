import { Module } from '@nestjs/common';
import { BmsController } from './bms.controller';
import { BmsService } from './bms.service';

@Module({
  controllers: [BmsController],
  providers: [BmsService]
})
export class BmsModule {}

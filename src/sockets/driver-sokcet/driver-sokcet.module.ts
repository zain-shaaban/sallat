import { Module } from '@nestjs/common';
import { DriverSocketGateway } from './driver-sokcet.gateway';

@Module({
  providers: [DriverSocketGateway],
})
export class DriverSokcetModule {}

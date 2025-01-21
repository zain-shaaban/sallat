import { Module } from '@nestjs/common';
import { TestingDriverSocketGateway } from './driver-socket.gateway';

@Module({
  providers: [TestingDriverSocketGateway],
})
export class TestingDriverSokcetModule {}

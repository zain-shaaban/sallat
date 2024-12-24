import { Module } from '@nestjs/common';
import { AdminSocketGateway } from './admin-socket.gateway';

@Module({
  providers: [AdminSocketGateway],
})
export class AdminSocketModule {}

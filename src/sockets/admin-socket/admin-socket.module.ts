import { Module } from '@nestjs/common';
import { AdminSocketGateway } from './admin-socket.gateway';
import { PathModule } from 'src/path/path.module';

@Module({
  imports:[PathModule],
  providers: [AdminSocketGateway],
})
export class AdminSocketModule {}

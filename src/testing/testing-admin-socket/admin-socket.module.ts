import { Module } from '@nestjs/common';
import { TestingAdminSocketGateway } from './admin-socket.gateway';
import { PathModule } from 'src/path/path.module';

@Module({
  imports:[PathModule],
  providers: [TestingAdminSocketGateway],
})
export class TestingAdminSocketModule {}

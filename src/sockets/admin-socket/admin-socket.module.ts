import { Module, forwardRef } from '@nestjs/common';
import { AdminSocketGateway } from './admin-socket.gateway';
import { DriverSocketModule } from '../driver-sokcet/driver-sokcet.module';

@Module({
  imports: [forwardRef(() => DriverSocketModule)],
  providers: [AdminSocketGateway],
  exports: [AdminSocketGateway],
})
export class AdminSocketModule {}

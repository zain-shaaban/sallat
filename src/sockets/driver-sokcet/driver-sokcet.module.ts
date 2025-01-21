import { Module, forwardRef } from '@nestjs/common';
import { DriverSocketGateway } from './driver-sokcet.gateway';
import { AdminSocketModule } from '../admin-socket/admin-socket.module';

@Module({
  imports: [forwardRef(() => AdminSocketModule)],
  providers: [DriverSocketGateway],
})
export class DriverSokcetModule {}

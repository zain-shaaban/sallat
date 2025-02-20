import { Module, forwardRef } from '@nestjs/common';
import { AdminSocketGateway } from './admin-socket.gateway';
import { PathModule } from 'src/path/path.module';
import { DriverSokcetModule } from '../driver-sokcet/driver-sokcet.module';

@Module({
  imports: [PathModule, forwardRef(() => DriverSokcetModule)],
  providers: [AdminSocketGateway],
  exports: [AdminSocketGateway],
})
export class AdminSocketModule {}

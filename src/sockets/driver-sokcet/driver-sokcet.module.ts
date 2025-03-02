import { Module, forwardRef } from '@nestjs/common';
import { DriverSocketGateway } from './driver-sokcet.gateway';
import { AdminSocketModule } from '../admin-socket/admin-socket.module';
import { TripModule } from 'src/trip/trip.module';

@Module({
  imports: [
    forwardRef(() => AdminSocketModule),
    forwardRef(() => TripModule),
  ],
  providers: [DriverSocketGateway],
  exports: [DriverSocketGateway],
})
export class DriverSocketModule {}

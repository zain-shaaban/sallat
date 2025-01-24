import { forwardRef, Module } from '@nestjs/common';
import { TripService } from './trip.service';
import { TripController } from './trip.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Trip } from './entities/trip.entity';
import { CustomerModule } from 'src/customer/customer.module';
import { VendorModule } from 'src/vendor/vendor.module';
import { AdminSocketModule } from 'src/sockets/admin-socket/admin-socket.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Trip]),
    CustomerModule,
    forwardRef(() => VendorModule),
    AdminSocketModule,
  ],
  controllers: [TripController],
  providers: [TripService],
  exports: [SequelizeModule.forFeature([Trip]),forwardRef(()=>CustomerModule),forwardRef(()=>VendorModule)],
})
export class TripModule {}

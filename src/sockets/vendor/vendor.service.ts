import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Namespace, Socket } from 'socket.io';
import { Repository } from 'typeorm';
import { VendorTrips } from './vendor-trips.entity';
import { LogService } from '../logs/logs.service';

@Injectable()
export class VendorSocketService {
  private io: Namespace;
  private availability: boolean = true;

  constructor(
    @InjectRepository(VendorTrips)
    private readonly vendorRepository: Repository<VendorTrips>,
    @Inject() private readonly logService: LogService,
  ) {}

  async handleVendorConnection(client: Socket) {
    const trips = await this.vendorRepository.find({
      where: { vendorID: client.data.id },
      order: { createdAt: 'DESC' },
    });

    client.emit('onConnection', { trips, availability: this.availability });
  }

  async handleSendNewTrip(
    vendorID: string,
    vendorName: string,
    customerName: string,
    customerPhoneNumber: string,
  ) {
    this.io.server.of('/admin').emit('newVendorTrip', {
      vendorID,
      vendorName,
      customerName,
      customerPhoneNumber,
    });

    this.logService.createNewVendorTripLog(vendorName, customerName);

    this.vendorRepository.save({ vendorID, customerName, customerPhoneNumber });
  }

  changeAvailability(managerName: string, availability: boolean) {
    this.availability = availability;
    this.io.server.of('/admin').emit('changeAvailabtility', { availability });
    this.io.server.of('/vendor').emit('changeAvailability', { availability });
    this.logService.changeVendorAvailabilityLog(managerName, availability);
  }

  public initIO(server: Namespace) {
    this.io = server;
  }
}

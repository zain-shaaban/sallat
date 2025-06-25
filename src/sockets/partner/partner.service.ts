import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Namespace, Socket } from 'socket.io';
import { Repository } from 'typeorm';
import { PartnerTrips } from './partner.entity';
import { LogService } from '../logs/logs.service';
import { IPartnerTrip } from './partner.interface';

@Injectable()
export class PartnerService {
  private io: Namespace;
  private availability: boolean = true;
  public partnerTrips: IPartnerTrip[] = [];

  constructor(
    @InjectRepository(PartnerTrips)
    private readonly vendorRepository: Repository<PartnerTrips>,
    @Inject() private readonly logService: LogService,
  ) {}

  async handlePartnerConnection(client: Socket) {
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
    this.io.server.of('/admin').emit('newPartnerTrip', {
      vendorID,
      vendorName,
      customerName,
      customerPhoneNumber,
    });

    this.logService.createPartnerTripLog(
      vendorName,
      customerName,
      customerPhoneNumber,
    );

    this.partnerTrips.push({
      vendorID,
      vendorName,
      customerName,
      customerPhoneNumber,
    });

    this.vendorRepository.save({ vendorID, customerName, customerPhoneNumber });
  }

  changePartnerAvailability(ccName: string, availability: boolean) {
    this.availability = availability;
    this.io.server
      .of('/admin')
      .emit('partnerAvailabilityChanged', { availability });
    this.io.server
      .of('/partner')
      .emit('partnerAvailabilityChanged', { availability });
    this.logService.changePartnerAvailabilityLog(ccName, availability);
  }

  tripAccepted(vendorID: string) {
    const targetSocket = [...this.io.sockets.values()].find(
      (socket) => socket.data.id === vendorID,
    );

    targetSocket?.emit('tripAccepted');
  }

  tripRejected(vendorID: string) {
    const targetSocket = [...this.io.sockets.values()].find(
      (socket) => socket.data.id === vendorID,
    );

    targetSocket?.emit('tripRejected');
  }

  returnParterTripsToAdmins() {
    return this.partnerTrips;
  }

  public initIO(server: Namespace) {
    this.io = server;
  }
}

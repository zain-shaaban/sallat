import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Namespace, Socket } from 'socket.io';
import { Repository } from 'typeorm';
import { PartnerTrips } from './partner.entity';
import { LogService } from '../logs/logs.service';
import { IPartnerTrip } from './partner.interface';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class PartnerService {
  private io: Namespace;
  public availability: boolean = true;
  public partnerTrips: IPartnerTrip[] = [];

  constructor(
    @InjectRepository(PartnerTrips)
    private readonly partnerRepository: Repository<PartnerTrips>,
    @Inject() private readonly logService: LogService,
  ) {}

  async handlePartnerConnection(client: Socket) {
    const trips = await this.partnerRepository.find({
      where: { partnerID: client.data.id },
      order: { createdAt: 'DESC' },
    });

    client.emit('onConnection', { trips, availability: this.availability });
  }

  async handleSendNewTrip(
    partnerID: string,
    partnerName: string,
    customerName: string,
    customerPhoneNumber: string,
  ) {
    const partnerTrip = await this.partnerRepository.save({
      partnerID,
      partnerName,
      customerName,
      customerPhoneNumber,
    });

    this.io.server.of('/admin').emit('newPartnerTrip', {
      requestID: partnerTrip.requestID,
      partnerID,
      partnerName,
      customerName,
      customerPhoneNumber,
    });

    this.logService.createPartnerTripLog(
      partnerName,
      customerName,
      customerPhoneNumber,
    );

    this.partnerTrips.push({
      requestID: partnerTrip.requestID,
      partnerID,
      partnerName,
      customerName,
      customerPhoneNumber,
    });
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

  tripAccepted(requestID: number, partnerID: string) {
    this.partnerTrips = this.partnerTrips.filter(
      (trip) => trip.requestID !== requestID,
    );

    this.partnerRepository.update(requestID, { state: 'accepted' });

    const targetSocket = [...this.io.sockets.values()].find(
      (socket) => socket.data.id === partnerID,
    );

    targetSocket?.emit('tripAccepted');
  }

  tripRejected(requestID: number, partnerID: string) {
    this.partnerTrips = this.partnerTrips.filter(
      (trip) => trip.requestID !== requestID,
    );

    this.partnerRepository.update(requestID, { state: 'rejected' });
    const targetSocket = [...this.io.sockets.values()].find(
      (socket) => socket.data.id === partnerID,
    );

    targetSocket?.emit('tripRejected');
  }

  handleCancelPartnerTrip(
    partnerID: string,
    partnerName: string,
    requestID: number,
  ) {
    const targetTrip = this.partnerTrips.find(
      (trip) => trip.requestID == requestID && trip.partnerID == partnerID,
    );

    if (!targetTrip)
      throw new WsException(`Trip with id ${requestID} not found.`);

    this.partnerTrips = this.partnerTrips.filter(
      (trip) => trip.requestID !== requestID,
    );

    this.io.server
      .of('/admin')
      .emit('partnerTrips', { partnerTrips: this.partnerTrips });

    this.partnerRepository.update(requestID, { state: 'cancelled' });

    this.logService.cancelPartnerTripLog(partnerName, targetTrip.customerName);
  }

  returnParterTripsToAdmins() {
    return this.partnerTrips;
  }

  public async initIO(server: Namespace) {
    this.io = server;
    this.partnerTrips = await this.partnerRepository.find({
      where: { state: 'pending' },
      select: {
        requestID: true,
        partnerID: true,
        partnerName: true,
        customerName: true,
        customerPhoneNumber: true,
      },
    });
  }
}

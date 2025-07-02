import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Namespace, Socket } from 'socket.io';
import { TripService } from 'src/trip/trip.service';
import { WsException } from '@nestjs/websockets';
import { ITripInSocketsArray } from 'src/trip/interfaces/trip-socket';
import { NotificationService } from 'src/notification/notification.service';
import { CoordinatesDto } from 'src/customer/dto/location.dto';
import { Vendor } from 'src/vendor/entities/vendor.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { Account } from 'src/account/entities/account.entity';
import { LogService } from '../logs/logs.service';
import { OnlineDrivers } from '../shared-online-drivers/online-drivers';
import { PartnerService } from '../partner/partner.service';
import { InjectRepository } from '@nestjs/typeorm';
import { DriverMetadata } from 'src/account/entities/driverMetadata.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AdminService {
  private io: Namespace;

  constructor(
    @Inject(forwardRef(() => TripService))
    private readonly tripService: TripService,
    @Inject() private readonly onlineDrivers: OnlineDrivers,
    @Inject() private readonly notificationService: NotificationService,
    @Inject() private readonly logService: LogService,
    @Inject() private readonly partnerService: PartnerService,
    @InjectRepository(DriverMetadata)
    private readonly driverRepository: Repository<DriverMetadata>,
  ) {}

  handleAdminConnection(client: Socket) {
    client.emit('onConnection', {
      onlineDrivers: this.onlineDrivers.drivers,
      readyTrips: this.tripService.readyTrips,
      ongoingTrips: this.tripService.ongoingTrips,
      pendingTrips: this.tripService.pendingTrips,
      partnerTrips: this.partnerService.partnerTrips,
    });
  }

  resetServerEnvironment() {
    this.onlineDrivers.drivers.length = 0;
    this.tripService.readyTrips.length = 0;
    this.tripService.pendingTrips.length = 0;
    this.tripService.ongoingTrips.length = 0;
    const namespace = this.io.server.of('/driver');
    for (const [socketId, socket] of namespace.sockets) {
      socket.disconnect();
    }
  }

  async handleAssignNewDriverToTheTrip(
    tripID: string,
    driverID: string,
    ccName: string,
  ) {
    const trip = this.tripService.pendingTrips.find((t) => t.tripID === tripID);

    const driver = this.onlineDrivers.drivers.find(
      (d) => d.driverID === driverID,
    );

    const driverMetadata = await this.driverRepository.findOneBy({
      id: driverID,
    });

    if (!trip) throw new WsException(`Trip with ID ${tripID} not found`);

    this.moveTripFromPendingToReady(
      trip,
      driverID,
      driverMetadata.assignedVehicleNumber,
    );

    this.submitNewTrip(trip);

    this.sendDriversArrayToAdmins();

    this.logService.assignNewDriverLog(
      driverID,
      driver?.driverName,
      ccName,
      trip.tripNumber,
    );

    this.notificationService.send({
      title: 'رحلة جديدة',
      content: 'اضغط لعرض تفاصيل الرحلة',
      driverID: trip.driverID,
    });
  }

  handleChangeDriverAvailability(
    driverID: string,
    available: boolean,
    ccName: string,
  ) {
    const driver = this.onlineDrivers.drivers.find(
      (d) => d.driverID === driverID,
    );

    if (!driver) throw new WsException(`Driver with ID ${driverID} not found`);

    driver.available = available;
    if (available)
      this.logService.changeDriverToAvailableByCcLog(
        driverID,
        driver.driverName,
        ccName,
      );
    else
      this.logService.changeDriverToUnAvailableByCcLog(
        driverID,
        driver.driverName,
        ccName,
      );
    this.sendDriversArrayToAdmins();

    if (driver?.socketID)
      this.io.server
        .of('/driver')
        .to(driver.socketID)
        .emit('availabilityChange', { available });
  }

  handleChangePartnerAvailability(ccName: string, availability: boolean) {
    this.partnerService.changePartnerAvailability(ccName, availability);
  }

  handleAcceptPartnerTrip(
    ccName: string,
    vendorID: string,
    vendorName: string,
  ) {
    this.partnerService.tripAccepted(vendorID);
    this.logService.partnerTripAcceptedLog(ccName, vendorName);
    this.partnerService.partnerTrips = this.partnerService.partnerTrips.filter(
      (trip) => trip.vendorID !== vendorID,
    );
    this.io.server
      .of('/admin')
      .emit('partnerTrips', { partnerTrips: this.partnerService.partnerTrips });
  }

  handleRejectPartnerTrip(
    ccName: string,
    vendorID: string,
    vendorName: string,
  ) {
    this.partnerService.tripRejected(vendorID);
    this.logService.partnerTripRejectedLog(ccName, vendorName);
    this.partnerService.partnerTrips = this.partnerService.partnerTrips.filter(
      (trip) => trip.vendorID !== vendorID,
    );
    this.io.server
      .of('/admin')
      .emit('partnerTrips', { partnerTrips: this.partnerService.partnerTrips });
  }

  handleAssignRoutedPath(tripID: string, routedPath: CoordinatesDto[]) {
    const trip = this.tripService.pendingTrips.find((t) => t.tripID === tripID);

    if (!trip) throw new WsException(`Trip with ID ${tripID} not found`);

    trip.routedPath = routedPath;

    this.sendTripsToAdmins();
  }

  handlePullTrip(tripID: string, ccName: string) {
    const trip = this.tripService.readyTrips.find((t) => t.tripID === tripID);

    if (!trip) throw new WsException(`Trip with ID ${tripID} not found`);

    const driver = this.onlineDrivers.drivers.find(
      (d) => d.driverID === trip.driverID,
    );

    if (!driver)
      throw new WsException(`Driver with ID ${trip.driverID} not found`);

    this.moveTripFromReadyToPending(trip);

    this.sendTripPulledForDriver(driver.socketID, trip.tripID);

    this.logService.pullTripLog(
      driver.driverID,
      driver.driverName,
      ccName,
      trip.tripNumber,
    );
  }

  handleCancelTrip(tripID: string, ccName: string) {
    const tripsArrays = [
      this.tripService.readyTrips,
      this.tripService.ongoingTrips,
      this.tripService.pendingTrips,
    ];

    for (const arr of tripsArrays) {
      const index = arr.findIndex((t) => t.tripID === tripID);

      if (index !== -1) {
        const driver = this.onlineDrivers.drivers.find(
          (d) => d.driverID === arr[index].driverID,
        );

        if (driver) {
          this.sendTripCancelledForDriver(driver.socketID, arr[index].tripID);

          this.notificationService.send({
            title: 'تم إلغاء الرحلة',
            content: 'الرحلة القائمة لديك تم إلغاؤها',
            driverID: driver.driverID,
          });
        }

        this.logService.cancelledTripLog(
          ccName,
          arr[index].tripNumber,
          driver?.driverID,
        );

        arr.splice(index, 1);

        this.sendDriversArrayToAdmins();

        this.sendTripsToAdmins();

        return;
      }
    }
    throw new WsException(`Trip with ID ${tripID} not found`);
  }

  removeTripFromOnGoing(trip: ITripInSocketsArray) {
    this.tripService.ongoingTrips = this.tripService.ongoingTrips.filter(
      (t: ITripInSocketsArray) => t.tripID !== trip.tripID,
    );

    this.sendTripsToAdmins();
  }

  moveTripFromReadyToOnGoing(trip: ITripInSocketsArray) {
    this.tripService.readyTrips = this.tripService.readyTrips.filter(
      (t: ITripInSocketsArray) => t.tripID !== trip.tripID,
    );

    this.tripService.ongoingTrips.push(trip);

    this.sendTripsToAdmins();
  }

  moveTripFromReadyToPending(trip: ITripInSocketsArray) {
    this.tripService.readyTrips = this.tripService.readyTrips.filter(
      (t) => t.tripID !== trip.tripID,
    );

    trip.driverID = null;

    this.tripService.pendingTrips.push(trip);

    this.sendTripsToAdmins();
  }

  moveTripFromPendingToReady(
    trip: ITripInSocketsArray,
    driverID: string,
    vehicleNumber: string,
  ) {
    this.tripService.pendingTrips = this.tripService.pendingTrips.filter(
      (t) => t.tripID !== trip.tripID,
    );

    trip.driverID = driverID;
    trip.vehicleNumber = vehicleNumber;

    this.tripService.readyTrips.push(trip);
  }

  moveTripFromOngoingToPending(trip: ITripInSocketsArray, reason: string) {
    this.tripService.ongoingTrips = this.tripService.ongoingTrips.filter(
      (t) => t.tripID !== trip.tripID,
    );

    Object.assign(trip, { driverID: null, path: [], tripState: {} });

    this.tripService.pendingTrips.push(trip);

    this.sendTripsToAdmins();
  }

  submitNewTrip(trip: ITripInSocketsArray) {
    this.sendTripsToAdmins();
    this.sendTripToDriver(trip);
  }

  sendTripsToAdmins() {
    this.io.server.of('/admin').emit('tripUpdate', {
      readyTrips: this.tripService.readyTrips,
      pendingTrips: this.tripService.pendingTrips,
      ongoingTrips: this.tripService.ongoingTrips,
    });
  }

  sendTripToDriver(trip: ITripInSocketsArray) {
    const driver = this.onlineDrivers.drivers.find(
      (d) => d.driverID === trip.driverID,
    );

    this.io.server.of('/driver').to(driver.socketID).emit('newTrip', { trip });
  }

  sendDriversArrayToAdmins() {
    this.io.server.of('/admin').emit('driverConnection', {
      onlineDrivers: this.onlineDrivers.drivers,
    });
  }

  sendTripPulledForDriver(socketID: string, tripID: string) {
    this.io.server.of('/driver').to(socketID).emit('tripPulled', { tripID });
  }

  sendTripCancelledForDriver(socketID: string, tripID: string) {
    this.io.server.of('/driver').to(socketID).emit('tripCancelled', { tripID });
  }

  newVendor(vendor: Vendor) {
    this.io.server.of('/admin').emit('newVendor', { vendor });
  }

  newCustomer(customer: Customer) {
    this.io.server.of('/admin').emit('newCustomer', { customer });
  }

  newDriver(driver: Account) {
    this.io.server.of('/admin').emit('newDriver', { driver });
  }

  deleteVendor(vendorID: string) {
    this.io.server.of('/admin').emit('deleteVendor', { vendorID });
  }

  deleteCustomer(customerID: string) {
    this.io.server.of('/admin').emit('deleteCustomer', { customerID });
  }

  deleteDriver(driverID: string) {
    this.io.server.of('/admin').emit('deleteDriver', { driverID });
  }

  updateVendor(vendor: Partial<Vendor>) {
    this.io.server.of('/admin').emit('updateVendor', { vendor });
  }

  updateCustomer(customer: Partial<Customer>) {
    this.io.server.of('/admin').emit('updateCustomer', { customer });
  }

  updateDriver(driver: { id: string; assignedVehicleNumber: string }) {
    this.io.server.of('/admin').emit('updateDriver', { driver });
  }

  sendNewLocation(driverID: string, location: object) {
    this.io.server.of('/admin').emit('location', { driverID, location });
  }

  sendHttpLocation(driverID: string, location: CoordinatesDto) {
    this.io.server.of('/admin').emit('httpLocation', { driverID, location });
  }

  initIO(server: Namespace) {
    this.io = server;
  }
}

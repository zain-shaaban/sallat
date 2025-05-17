import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { TripService } from 'src/trip/trip.service';
import { DriverService } from '../driver/driver.service';
import { WsException } from '@nestjs/websockets';
import { ITripInSocketsArray } from 'src/trip/interfaces/trip-socket';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationSocket } from '../notifications/entites/notification-socket.entity';
import { Repository } from 'typeorm';
import { NotificationService } from 'src/notification/notification.service';
import { CoordinatesDto } from 'src/customer/dto/location.dto';
import { Vendor } from 'src/vendor/entities/vendor.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { Account } from 'src/account/entities/account.entity';

@Injectable()
export class AdminService {
  private server: Server;

  constructor(
    @Inject(forwardRef(()=>TripService)) private readonly tripService: TripService,
    @Inject() private readonly driverService: DriverService,
    @Inject() private readonly notificationService: NotificationService,
    @InjectRepository(NotificationSocket)
    private readonly notificationSocketRepository: Repository<NotificationSocket>,
  ) {}

  handleAdminConnection(client: Socket) {
    client.emit('onConnection', {
      onlineDrivers: this.driverService.onlineDrivers,
      readyTrips: this.tripService.readyTrips,
      ongoingTrips: this.tripService.ongoingTrips,
      pendingTrips: this.tripService.pendingTrips,
    });
  }

  resetServerEnvironment() {
    this.driverService.onlineDrivers.length = 0;
    this.tripService.readyTrips.length = 0;
    this.tripService.pendingTrips.length = 0;
    this.tripService.ongoingTrips.length = 0;
    const namespace = this.server.of('/driver');
    for (const [socketId, socket] of namespace.sockets) {
      socket.disconnect();
    }
  }

  handleAssignNewDriverToTheTrip(tripID: string, driverID: string) {
    const trip = this.tripService.pendingTrips.find((t) => t.tripID === tripID);

    if (!trip) throw new WsException(`Trip with ID ${tripID} not found`);

    this.moveTripFromPendingToReady(trip);

    this.submitNewTrip(trip);

    this.sendDriversArrayToAdmins();

    this.notificationService.send({
      title: 'رحلة جديدة',
      content: 'اضغط لعرض تفاصيل الرحلة',
      driverID: trip.driverID,
    });
  }

  handleChangeDriverAvailability(driverID: string, available: boolean) {
    const driver = this.driverService.onlineDrivers.find(
      (d) => d.driverID === driverID,
    );

    if (!driver) throw new WsException(`Driver with ID ${driverID} not found`);

    driver.available = available;

    this.sendDriversArrayToAdmins();

    if (driver?.socketID)
      this.server
        .of('/driver')
        .to(driver.socketID)
        .emit('availabilityChange', { available });
  }

  handleAssignRoutedPath(tripID: string, routedPath: CoordinatesDto[]) {
    const trip = this.tripService.pendingTrips.find((t) => t.tripID === tripID);

    if (!trip) throw new WsException(`Trip with ID ${tripID} not found`);

    trip.routedPath = routedPath;

    this.sendTripsToAdmins();
  }

  handlePullTrip(tripID: string) {
    const trip = this.tripService.readyTrips.find((t) => t.tripID === tripID);

    if (!trip) throw new WsException(`Trip with ID ${tripID} not found`);

    const driver = this.driverService.onlineDrivers.find(
      (d) => d.driverID === trip.driverID,
    );

    if (!driver)
      throw new WsException(`Driver with ID ${trip.driverID} not found`);

    this.sendTripPulledNotification(trip.tripID, trip.driverID);

    this.moveTripFromReadyToPending(trip);

    this.sendTripPulledForDriver(driver.socketID, trip.tripID);
  }

  handleCancelTrip(tripID: string) {
    const tripsArrays = [
      this.tripService.readyTrips,
      this.tripService.ongoingTrips,
      this.tripService.pendingTrips,
    ];

    for (const arr of tripsArrays) {
      const index = arr.findIndex((t) => t.tripID === tripID);

      if (index !== -1) {
        const driver = this.driverService.onlineDrivers.find(
          (d) => d.driverID === arr[index].driverID,
        );

        if (driver) {
          this.sendTripCancelledForDriver(driver.socketID, driver.driverID);

          this.notificationService.send({
            title: 'تم إلغاء الرحلة',
            content: 'الرحلة القائمة لديك تم إلغاؤها',
            driverID: driver.driverID,
          });
        }

        this.sendTripCancelledNotificationForAdmin(tripID);

        this.sendDriversArrayToAdmins();

        this.sendTripsToAdmins();

        arr.splice(index, 1);

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

  moveTripFromPendingToReady(trip: ITripInSocketsArray) {
    this.tripService.pendingTrips = this.tripService.pendingTrips.filter(
      (t) => t.tripID !== trip.tripID,
    );
    this.tripService.readyTrips.push(trip);
  }

  moveTripFromOngoingToPending(trip: ITripInSocketsArray) {
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
    this.sendTripReceivedNotification(trip.tripID, trip.driverID);
  }

  sendTripsToAdmins() {
    this.server.of('/admin').emit('tripUpdate', {
      readyTrips: this.tripService.readyTrips,
      pendingTrips: this.tripService.pendingTrips,
      ongoingTrips: this.tripService.ongoingTrips,
    });
  }

  sendTripToDriver(trip: ITripInSocketsArray) {
    const driver = this.driverService.onlineDrivers.find(
      (d) => d.driverID === trip.driverID,
    );

    if (!driver.socketID)
      throw new WsException(`Driver with ID ${trip.driverID} not online`);

    this.server.of('/driver').to(driver.socketID).emit('newTrip', { trip });
  }

  sendTripReceivedNotification(tripID: string, driverID: string) {
    this.server.of('/notifications').emit('tripReceived', { tripID, driverID });

    this.notificationSocketRepository.save({
      type: 'tripReceived',
      data: { tripID, driverID },
    });
  }

  sendTripPulledNotification(tripID: string, driverID: string) {
    this.server.of('/notification').emit('tripPulled', { tripID, driverID });

    this.notificationSocketRepository.save({
      type: 'tripPulled',
      data: { tripID, driverID },
    });
  }

  sendDriversArrayToAdmins() {
    this.server.of('/admin').emit('driverConnection', {
      onlineDrivers: this.driverService.onlineDrivers,
    });
  }

  sendTripPulledForDriver(socketID: string, tripID: string) {
    this.server.of('/driver').to(socketID).emit('tripPulled', { tripID });
  }

  sendTripCancelledForDriver(socketID: string, tripID: string) {
    this.server.of('/driver').to(socketID).emit('tripCancelled', { tripID });
  }

  sendTripCancelledNotificationForAdmin(tripID: string) {
    this.server.of('/notifications').emit('tripCancelled', { tripID });

    this.notificationSocketRepository.save({
      type: 'tripCancelled',
      data: { tripID },
    });
  }

  newVendor(vendor: Vendor) {
    this.server.of('/admin').emit('newVendor', { vendor });
  }

  newCustomer(customer: Customer) {
    this.server.of('/admin').emit('newCustomer', { customer });
  }

  newDriver(driver: Account) {
    this.server.of('/admin').emit('newDriver', { driver });
  }

  deleteVendor(vendorID: string) {
    this.server.of('/admin').emit('deleteVendor', { vendorID });
  }

  deleteCustomer(customerID: string) {
    this.server.of('/admin').emit('deleteCustomer', { customerID });
  }

  deleteDriver(driverID: string) {
    this.server.of('/admin').emit('deleteDriver', { driverID });
  }

  updateVendor(vendor: Partial<Vendor>) {
    this.server.of('/admin').emit('updateVendor', { vendor });
  }

  updateCustomer(customer: Partial<Customer>) {
    this.server.of('/admin').emit('updateCustomer', { customer });
  }

  updateDriver(driver: Account) {
    this.server.of('/admin').emit('updateDriver', { driver });
  }

  sendNewLocation(driverID: string, location: object) {
    this.server.of('/admin').emit('location', { driverID, location });
  }

  sendHttpLocation(driverID: string, location: CoordinatesDto) {
    this.server.of('/admin').emit('httpLocation', { driverID, location });
  }

  sendDriverDisconnectNotification(driverID: string) {
    this.server.of('/notifications').emit('driverConnection', {
      driverID,
      connection: false,
    });

    this.notificationSocketRepository.save({
      type: 'driverConnection',
      data: {
        driverID,
        connection: false,
      },
    });
  }

  initIO(server: Server) {
    this.server = server;
  }
}

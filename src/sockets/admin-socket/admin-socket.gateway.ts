import {
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { onlineDrivers } from '../driver-sokcet/driver-sokcet.gateway';
import { Trip } from 'src/trip/entities/trip.entity';
import { ErrorLoggerService } from 'src/common/error_logger/error_logger.service';

export let readyTrips: any[] = [];
export let ongoingTrips: any[] = [];
export let pendingTrips: any[] = [];

@WebSocketGateway({
  namespace: 'admin',
  cors: {
    origin: '*',
  },
})
export class AdminSocketGateway implements OnGatewayConnection {
  @WebSocketServer()
  io: Namespace;

  constructor(private readonly logger: ErrorLoggerService) {}

  handleConnection(client: Socket) {
    try {
      client.emit('onConnection', {
        onlineDrivers,
        readyTrips,
        pendingTrips,
        ongoingTrips,
      });
      return { status: true };
    } catch (error) {
      this.logger.error(error.message, error.stack);
      return {
        status: false,
        message: error.message,
      };
    }
  }

  @SubscribeMessage('resetEnvironment')
  resetAllVariables() {
    try {
      readyTrips.length = 0;
      ongoingTrips.length = 0;
      pendingTrips.length = 0;
      onlineDrivers.length = 0;
      return { status: true };
    } catch (error) {
      this.logger.error(error.message, error.stack);
      return {
        status: false,
        message: error.message,
      };
    }
  }

  @SubscribeMessage('assignNewDriver')
  assignNewDriver(@MessageBody() idPairs: any) {
    try {
      const trip = pendingTrips.find((trip) => trip.tripID == idPairs.tripID);
      if (trip) {
        trip.driverID = idPairs.driverID;
        pendingTrips = pendingTrips.filter(
          (trip) => trip.tripID != idPairs.tripID,
        );
        readyTrips.push(trip);
        this.submitNewTrip(trip);
        this.sendDriversArrayToAdmins();
      }
      return { status: true };
    } catch (error) {
      this.logger.error(error.message, error.stack);
      return {
        status: false,
        message: error.message,
      };
    }
  }

  submitNewTrip(trip: Trip) {
    this.sendTripsToAdmins();
    this.sendTripToDriver(trip);
    let driver = onlineDrivers.find(
      (driver) => driver.driverID == trip.driverID && driver.available == true,
    );
    if (driver) driver.available = false;
    this.io.server
      .of('/notifications')
      .emit('tripReceived', { tripID: trip.tripID, driverID: trip.driverID });
  }

  sendTripsToAdmins() {
    this.io.server
      .of('/admin')
      .emit('tripUpdate', { readyTrips, pendingTrips, ongoingTrips });
  }

  sendTripToDriver(trip: Trip) {
    const driverID = trip.driverID;
    const driver = onlineDrivers.find(
      (driver) => driver.driverID == driverID && driver.available == true,
    );
    if (this.io.server.of('/driver').sockets.get(driver?.socketID)) {
      this.io.server.of('/driver').to(driver.socketID).emit('newTrip', trip);
    }
  }

  moveTripFromReadyToPending(myTrip: Trip) {
    readyTrips = readyTrips.filter(
      (trip: Trip) => trip.driverID != myTrip.driverID,
    );
    myTrip.driverID = null;
    pendingTrips.push(myTrip);
    this.sendTripsToAdmins();
  }

  moveTripFromReadyToOnGoing(myTrip: Trip) {
    readyTrips = readyTrips.filter(
      (trip: Trip) => trip.tripID != myTrip.tripID,
    );
    ongoingTrips.push(myTrip);
    this.sendTripsToAdmins();
  }

  removeTripFromOnGoing(myTrip: Trip) {
    ongoingTrips = ongoingTrips.filter(
      (trip: Trip) => trip.tripID != myTrip.tripID,
    );
    this.sendTripsToAdmins();
  }
  moveTripFromOngoingToPending(myTrip) {
    ongoingTrips = ongoingTrips.filter(
      (trip) => trip.driverID != myTrip.driverID,
    );
    myTrip.driverID = null;
    myTrip.path = [];
    myTrip.tripState = {};
    pendingTrips.push(myTrip);
    this.sendTripsToAdmins();
  }

  newVendor(vendor) {
    this.io.server.of('/admin').emit('newVendor', vendor);
  }

  newCustomer(customer) {
    this.io.server.of('/admin').emit('newCustomer', customer);
  }

  newDriver(driver) {
    this.io.server.of('/admin').emit('newDriver', driver);
  }

  deleteVendor(vendorID) {
    this.io.server.of('/admin').emit('deleteVendor', { vendorID });
  }

  deleteCustomer(customerID) {
    this.io.server.of('/admin').emit('deleteCustomer', { customerID });
  }

  deleteDriver(driverID) {
    this.io.server.of('/admin').emit('deleteDriver', { driverID });
  }

  updateVendor(vendor) {
    this.io.server.of('/admin').emit('updateVendor', vendor);
  }

  updateCustomer(customer) {
    this.io.server.of('/admin').emit('updateCustomer', customer);
  }

  updateDriver(driver) {
    this.io.server.of('/admin').emit('updateDriver', driver);
  }

  sendDriversArrayToAdmins() {
    this.io.server.of('/admin').emit('driverConnection', onlineDrivers);
  }

  sendNewLocation(driverID: number, location: object) {
    this.io.server.of('/admin').emit('httpLocation', { driverID, location });
  }
}

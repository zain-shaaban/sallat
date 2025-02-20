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

  handleConnection(client: Socket) {
    client.emit('onConnection', {
      onlineDrivers,
      readyTrips,
      pendingTrips,
      ongoingTrips,
    });
  }

  @SubscribeMessage('tripUpdate')
  tripsUpdate() {
    this.io.server.of('/admin').emit('');
  }

  @SubscribeMessage('savePath')
  async savePath() {}

  @SubscribeMessage('resetEnvironment')
  resetAllVariables() {
    readyTrips.length = 0;
    ongoingTrips.length = 0;
    pendingTrips.length = 0;
    onlineDrivers.length = 0;
  }

  @SubscribeMessage('assignNewDriver')
  assignNewDriver(@MessageBody() idPairs: any) {
    const trip = pendingTrips.find((trip) => trip.tripID == idPairs.tripID);
    if (trip) {
      trip.driverID = idPairs.driverID;
      pendingTrips = pendingTrips.filter(
        (trip) => trip.tripID != idPairs.tripID,
      );
      readyTrips.push(trip);
      this.sendTripsToAdmins();
      this.sendTripToDriver(trip);
    }
  }

  submitNewTrip(trip: Trip) {
    this.sendTripsToAdmins();
    this.sendTripToDriver(trip);
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
}

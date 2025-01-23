import {
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import * as polyline from '@mapbox/polyline';
import { getPathLength } from 'geolib';
import { onlineDrivers } from '../driver-sokcet/driver-sokcet.gateway';
import { Trip } from 'src/trip/entities/trip.entity';

export let locations: any[] = [];
// export let frequency: number = 5;
// export let threshold: number = 5;
export let readyTrips: any[] = [];
export let ongoingTrips: any[] = [];
export let pendingTrips: any[] = [];

// type timeFormat = {
//   startTime: number;
//   endTime: number;
// };

// let rawPath = locations;

// let matchedPath = [];

// export let time: timeFormat = {
//   startTime: 0,
//   endTime: 0,
// };

// const toCoordsArray = (latlngObject) => {
//   return latlngObject.map(({ lat, lng }) => [lat, lng]);
// };

// const mapMatching = async () => {
//   const polylineFromCoords = polyline.encode(toCoordsArray(rawPath));

//   function filterBackslashes(URL: string) {
//     return URL.replace(/\\/g, '%5C');
//   }

//   const matchURL = filterBackslashes(
//     `https://osrm.srv656652.hstgr.cloud/match/v1/driving/polyline(${polylineFromCoords})?overview=false`,
//   );

//   const res = await fetch(matchURL);
//   const json = await res.json();
//   matchedPath = json.tracepoints
//     .filter(Boolean)
//     .map((p) => p.location.reverse());
//   matchedDistance = getPathLength(
//     matchedPath.map((point) => {
//       return { latitude: point[0], longitude: point[1] };
//     }),
//   );
// };

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
  assignNewDriver(
    @MessageBody() idPairs: { driverID: string; tripID: string },
  ) {
    const trip = pendingTrips.find((trip) => trip.tripID == idPairs.tripID);
    if (trip) {
      trip.driverID = idPairs.driverID;
      pendingTrips = pendingTrips.filter(
        (trip) => trip.tripID != idPairs.tripID,
      );
      readyTrips.push(trip);
      this.sendTripToDriver(trip);
    }
  }

  submitNewTrip(trip: Trip) {
    this.sendTripsToAdmins();
    this.sendTripToDriver(trip);
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
}

export function moveTripFromReadyToPending(trip: Trip) {
  readyTrips = readyTrips.filter((trip) => trip != trip);
  trip.driverID = null;
  pendingTrips.push(trip);
}

export function moveTripFromReadyToOnGoing(trip: Trip) {
  readyTrips = readyTrips.filter((trip) => trip != trip);
  ongoingTrips.push(trip);
}

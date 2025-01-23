import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import {
  AdminSocketGateway,
  ongoingTrips,
  readyTrips,
} from '../admin-socket/admin-socket.gateway';
import { forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Trip } from 'src/trip/entities/trip.entity';

export let onlineDrivers: any[] = [];

@WebSocketGateway({
  namespace: 'driver',
  cors: {
    origin: '*',
  },
})
export class DriverSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  io: Namespace;

  constructor(
    @Inject(forwardRef(() => AdminSocketGateway))
    private readonly adminSocketGateway: AdminSocketGateway,
    @InjectModel(Trip) private readonly tripModel: typeof Trip,
  ) {}

  handleConnection(client: Socket) {
    const { driverID, lng, lat } = client.handshake.query;
    onlineDrivers.push({
      socketID: client.id,
      driverID,
      location: { lng: Number(lng), lat: Number(lat) },
      available: true,
    });
    this.io.server.of('/admin').emit('driverConnection', { onlineDrivers });
  }

  handleDisconnect(client: Socket) {
    const driverToDelete = onlineDrivers.find(
      (driver) => driver.socketID == client.id,
    );
    onlineDrivers = onlineDrivers.filter((driver) => driver != driverToDelete);
    this.io.server.of('/admin').emit('driverConnection', { onlineDrivers });
  }

  @SubscribeMessage('sendLocation')
  handleLocationUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() location: { lng: number; lat: number },
  ) {
    const driverID = this.getDriverID(client);
    const oneDriver = onlineDrivers.find(
      (driver) => driver.driverID == driverID,
    );
    if (oneDriver) {
      oneDriver.location = location;
      if (oneDriver.available == false) {
        const oneTrip = ongoingTrips.find(
          (trip) => trip.driverID == oneDriver.driverID,
        );
        oneTrip.path.push(location);
      }
    }
    this.io.server
      .of('/admin')
      .emit('location', { driverID: oneDriver.driverID, location });
  }

  @SubscribeMessage('rejectTrip')
  caseRejectTrip(@ConnectedSocket() client:Socket) {
    const driverID=this.getDriverID(client)
    const oneTrip = readyTrips.find((trip) => trip.driverID == driverID);
    this.adminSocketGateway.moveTripFromReadyToPending(oneTrip);
  }

  @SubscribeMessage('acceptTrip')
  caseAcceptTrip(@ConnectedSocket() client: Socket) {
    const driverID=this.getDriverID(client)
    onlineDrivers = onlineDrivers.map((driver) => {
      if (driver.driverID == driverID && driver.available == true)
        driver.available = false;
      return driver;
    });
    const trip = readyTrips.find((trip) => trip.driverID == driverID);
    this.adminSocketGateway.moveTripFromReadyToOnGoing(trip);
  }

  // @SubscribeMessage('cancelTrip')
  // canselTripByDriver(@ConnectedSocket() client: Socket) {
  //   const driverID=this.getDriverID(client);
  //   console.log(driverID)
  // }

  @SubscribeMessage('endTrip')
  async endTrip(@ConnectedSocket() client: Socket) {
    const driverID=this.getDriverID(client)
    onlineDrivers = onlineDrivers.map((driver) => {
      if (driver.driverID == driverID && driver.available == false)
        driver.available = true;
      return driver;
    });
    const trip = ongoingTrips.find((trip) => trip.driverID == driverID);
    trip.driverID = Number(trip.driverID);
    await this.tripModel.update(
      { driverID: trip.driverID, success: true, path: trip.path },
      { where: { tripID: trip.tripID } },
    );
    this.adminSocketGateway.removeTripFromOnGoing(trip);
  }

  getDriverID(client:Socket){
    return Number(client.handshake.query.driverID)
  }
}

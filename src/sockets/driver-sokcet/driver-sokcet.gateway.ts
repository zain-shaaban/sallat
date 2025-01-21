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
import { ongoingTrips } from '../admin-socket/admin-socket.gateway';

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

  handleConnection(client: Socket) {
    const { driverID, lng,lat } = client.handshake.query;
    onlineDrivers.push({
      socketID: client.id,
      driverID,
      location:{lng:Number(lng),lat:Number(lat)},
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
  handleLocationUpdate(@ConnectedSocket() client: Socket, @MessageBody() location: string) {
    location=JSON.parse(location)
    const socketID = client.id;
    const oneDriver = onlineDrivers.find(
      (driver) => driver.socketID == socketID,
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
}

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import {
  frequency,
  locations,
  threshold,
  time,
} from '../admin-socket/admin-socket.gateway';
export let connection: boolean = false;

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
    connection = true;
    this.io.server.of('/admin').emit('driverConnection', { connection });
    client.emit('onConnection', { frequency, threshold, time });
  }

  handleDisconnect() {
    connection = false;
    this.io.server.of('/admin').emit('driverConnection', { connection });
  }

  @SubscribeMessage('sendLocation')
  handleLocationUpdate(@MessageBody() location: string) {
    const adminNamespace = this.io.server.of('/admin');
    adminNamespace.emit('location', { location });
    locations.push(location);
  }
}

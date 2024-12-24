import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { frequency } from '../admin-socket/admin-socket.gateway';

export let locations = [];

@WebSocketGateway({
  namespace: 'driver',
  cors: {
    origin: '*',
  },
})
export class DriverSocketGateway implements OnGatewayConnection {
  @WebSocketServer()
  io: Namespace;

  handleConnection(client: Socket) {
    client.emit('onConnection', { frequency });
  }

  @SubscribeMessage('sendLocation')
  handleLocationUpdate(@MessageBody() location: string) {
    const adminNamespace = this.io.server.of('/admin');
    adminNamespace.emit('location', { location });
    locations.push(location);
  }
}
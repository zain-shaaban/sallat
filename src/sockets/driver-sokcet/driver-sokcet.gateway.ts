import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
} from '@nestjs/websockets';
import { Namespace, Server, Socket } from 'socket.io';

export let locations = [];

@WebSocketGateway({
  namespace: 'driver',
  cors: {
    origin: '*',
  },
})
export class DriverSocketGateway {
  @WebSocketServer()
  io: Namespace;

  @SubscribeMessage('sendLocation')
  handleLocationUpdate(@MessageBody() location: string) {
    const adminNamespace = this.io.server.of('/admin');
    adminNamespace.emit('location', {location});
  }

}

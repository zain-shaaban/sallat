import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Namespace } from 'socket.io';

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

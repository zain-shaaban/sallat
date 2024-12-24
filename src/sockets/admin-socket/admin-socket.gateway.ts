import {
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace, Server, Socket } from 'socket.io';
import { locations } from '../driver-sokcet/driver-sokcet.gateway';

export let frequency:number=5

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
    client.emit('onConnection',{locations,frequency});
  }

  @SubscribeMessage('clearPath')
  clearArrayOfLocations() {
    locations.length = 0;
  }


  @SubscribeMessage('setFrequency')
  setNewFrequency(@MessageBody() newFrequency:number){
    frequency=newFrequency;
    this.io.server.of('/driver').emit('frequency',{frequency})
  }
}

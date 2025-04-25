import { InjectRepository } from '@nestjs/typeorm';
import { OnGatewayConnection, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { NotificationSocket } from './entites/notification-socket.entity';
import { Repository } from 'typeorm';

@WebSocketGateway({
  namespace: 'notifications',
  cors: {
    origin: '*',
  },
})
export class NotificationSocketGateway implements OnGatewayConnection {
  constructor(
    @InjectRepository(NotificationSocket)
    private readonly notificationSocketRepository: Repository<NotificationSocket>,
  ) {}
  async handleConnection(client: Socket) {
    const notifications = await this.notificationSocketRepository.find();
    client.emit('onConnection', { notifications });
  }
}

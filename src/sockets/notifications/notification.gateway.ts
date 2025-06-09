import { InjectRepository } from '@nestjs/typeorm';
import {
  OnGatewayConnection,
  OnGatewayInit,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { NotificationSocket } from './entites/notification-socket.entity';
import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { WsAuthMiddleware } from 'src/common/middlewares/ws-auth.middleware';

@WebSocketGateway({
  namespace: 'notifications',
  cors: {
    origin: '*',
  },
})
export class NotificationSocketGateway
  implements OnGatewayConnection, OnGatewayInit
{
  constructor(
    @InjectRepository(NotificationSocket)
    private readonly notificationSocketRepository: Repository<NotificationSocket>,
    @Inject() private readonly authMiddleware: WsAuthMiddleware,
  ) {}
  async handleConnection(client: Socket) {
    const notifications = await this.notificationSocketRepository.find();
    client.emit('onConnection', { notifications });
  }

  afterInit(client: Socket) {
    this.authMiddleware.notificationAuth();
  }
}

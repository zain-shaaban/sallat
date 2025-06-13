import {
  OnGatewayConnection,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { Inject } from '@nestjs/common';
import { WsAuthMiddleware } from 'src/common/middlewares/ws-auth.middleware';
import { LogService } from './logs.service';
import { logger } from 'src/common/error_logger/logger.util';

@WebSocketGateway({
  namespace: 'logs',
  cors: {
    origin: '*',
  },
})
export class LogGateway implements OnGatewayConnection, OnGatewayInit {
  @WebSocketServer()
  server: Namespace;

  constructor(
    @Inject() private readonly authMiddleware: WsAuthMiddleware,
    @Inject() private readonly logService: LogService,
  ) {}
  async handleConnection(client: Socket) {
    try {
      this.logService.handleOnConnection(client);
    } catch (error) {
      logger.error(error.message, error.stack);
      client.disconnect();
    }
  }

  afterInit(client: Socket) {
    this.logService.initIO(this.server);
    client.use(this.authMiddleware.logAuth());
  }
}

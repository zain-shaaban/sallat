import { Inject, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { logger } from 'src/common/error_logger/logger.util';
import { ValidationSocketExceptionFilter } from 'src/common/filters/validation-exception-socket.filter';
import { WsAuthMiddleware } from 'src/common/middlewares/ws-auth.middleware';
import { PartnerService } from './partner.service';
import { CreateNewPartnerTrip } from '../dto/vendor.dto';

@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@UseFilters(ValidationSocketExceptionFilter)
@WebSocketGateway({
  namespace: 'partner',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class PartnerGateway implements OnGatewayConnection, OnGatewayInit {
  @WebSocketServer()
  server: Namespace;

  constructor(
    @Inject() private partnerService: PartnerService,
    @Inject() private authMiddleware: WsAuthMiddleware,
  ) {}

  handleConnection(client: Socket) {
    try {
      this.partnerService.handlePartnerConnection(client);
    } catch (error) {
      logger.error(error.message, error.stack);
      client.disconnect();
    }
  }

  @SubscribeMessage('newTrip')
  async newPartnerTrip(
    @ConnectedSocket() client: Socket,
    @MessageBody() newTripData: CreateNewPartnerTrip,
  ) {
    try {
      this.partnerService.handleSendNewTrip(
        client.data.id,
        client.data.name,
        newTripData.customerName,
        newTripData.customerPhoneNumber,
      );
      return { status: true };
    } catch (error) {
      if (!(error instanceof WsException))
        logger.error(error.message, error.stack);
      client.emit('exception', {
        eventName: 'newTrip',
        message: error.message,
      });
      return {
        status: false,
      };
    }
  }

  afterInit(client: Socket) {
    this.partnerService.initIO(this.server);
    client.use(this.authMiddleware.partnerAuth());
  }
}

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
import {
  CancelPartnerTripDto,
  CreateNewPartnerTripDto,
} from '../dto/partner.dto';

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

  @SubscribeMessage('cancelPartnerTrip')
  async cancelPartnerTrip(
    @ConnectedSocket() client: Socket,
    @MessageBody() cancelTripData: CancelPartnerTripDto,
  ) {
    try {
      this.partnerService.handleCancelPartnerTrip(
        client.data.id,
        client.data.name,
        cancelTripData.requestID,
      );
      return { status: true };
    } catch (error) {
      if (!(error instanceof WsException))
        logger.error(error.message, error.stack);
      client.emit('exception', {
        eventName: 'cancelPartnerTrip',
        message: error.message,
      });
      return {
        status: false,
      };
    }
  }
  @SubscribeMessage('newPartnerTrip')
  async newPartnerTrip(
    @ConnectedSocket() client: Socket,
    @MessageBody() newTripData: CreateNewPartnerTripDto,
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
        eventName: 'newPartnerTrip',
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

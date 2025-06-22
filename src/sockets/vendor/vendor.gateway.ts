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
import { VendorSocketService } from './vendor.service';
import { CreateNewVendorTripDto } from '../dto/vendor.dto';

@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@UseFilters(ValidationSocketExceptionFilter)
@WebSocketGateway({
  namespace: 'vendor',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class VendorSocketGateway implements OnGatewayConnection, OnGatewayInit {
  @WebSocketServer()
  server: Namespace;

  constructor(
    @Inject() private vendorService: VendorSocketService,
    @Inject() private authMiddleware: WsAuthMiddleware,
  ) {}

  handleConnection(client: Socket) {
    try {
      this.vendorService.handleVendorConnection(client);
    } catch (error) {
      logger.error(error.message, error.stack);
      client.disconnect();
    }
  }

  @SubscribeMessage('newTrip')
  async newVendorTrip(
    @ConnectedSocket() client: Socket,
    @MessageBody() newTripData: CreateNewVendorTripDto,
  ) {
    try {
      this.vendorService.handleSendNewTrip(
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
    this.vendorService.initIO(this.server);
    client.use(this.authMiddleware.vendorAuth());
  }
}

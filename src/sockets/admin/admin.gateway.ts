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
import { Inject, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { logger } from 'src/common/error_logger/logger.util';
import { AdminService } from './admin.service';
import {
  AssignRoutedPathDto,
  AssignNewDriverDto,
  SetAvailableDto,
  TripIdDto,
  ChangePartnerAvailabilityDto,
  TripStateDto,
} from '../dto/admin.dto';
import { ValidationSocketExceptionFilter } from 'src/common/filters/validation-exception-socket.filter';
import { WsAuthMiddleware } from 'src/common/middlewares/ws-auth.middleware';

@UseFilters(ValidationSocketExceptionFilter)
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@WebSocketGateway({
  namespace: 'admin',
  cors: {
    origin: '*',
  },
})
export class AdminSocketGateway implements OnGatewayConnection, OnGatewayInit {
  @WebSocketServer()
  server: Namespace;

  constructor(
    @Inject() private readonly adminService: AdminService,
    @Inject() private authMiddleware: WsAuthMiddleware,
  ) {}

  handleConnection(client: Socket) {
    try {
      this.adminService.handleAdminConnection(client);
      return { status: true };
    } catch (error) {
      logger.error(error.message, error.stack);
      client.disconnect();
    }
  }

  @SubscribeMessage('resetEnvironment')
  resetServerEnvirnoment(@ConnectedSocket() client: Socket) {
    try {
      this.adminService.resetServerEnvironment();
      return { status: true };
    } catch (error) {
      if (!(error instanceof WsException))
        logger.error(error.message, error.stack);
      client.emit('exception', {
        eventName: 'resetEnvironment',
        message: error.message,
      });
      return {
        status: false,
      };
    }
  }

  @SubscribeMessage('assignRoutedPath')
  assignRoutedPath(
    @ConnectedSocket() client: Socket,
    @MessageBody() receivedData: AssignRoutedPathDto,
  ) {
    try {
      this.adminService.handleAssignRoutedPath(
        receivedData.tripID,
        receivedData.routedPath,
      );
      return { status: true };
    } catch (error) {
      if (!(error instanceof WsException))
        logger.error(error.message, error.stack);
      client.emit('exception', {
        eventName: 'assignRoutedPath',
        message: error.message,
      });
      return {
        status: false,
      };
    }
  }

  @SubscribeMessage('assignNewDriver')
  assignNewDriver(
    @ConnectedSocket() client: Socket,
    @MessageBody() idPairs: AssignNewDriverDto,
  ) {
    try {
      this.adminService.handleAssignNewDriverToTheTrip(
        idPairs.tripID,
        idPairs.driverID,
        client.data.name,
      );
      return { status: true };
    } catch (error) {
      if (!(error instanceof WsException))
        logger.error(error.message, error.stack);
      client.emit('exception', {
        eventName: 'assignNewDriver',
        message: error.message,
      });
      return {
        status: false,
      };
    }
  }

  @SubscribeMessage('setAvailable')
  updateDriverAvailable(
    @ConnectedSocket() client: Socket,
    @MessageBody() setAvailableData: SetAvailableDto,
  ) {
    try {
      this.adminService.handleChangeDriverAvailability(
        setAvailableData.driverID,
        setAvailableData.available,
        client.data.name,
      );
      return {
        status: true,
      };
    } catch (error) {
      if (!(error instanceof WsException))
        logger.error(error.message, error.stack);
      client.emit('exception', {
        eventName: 'setAvailable',
        message: error.message,
      });
      return {
        status: false,
      };
    }
  }

  @SubscribeMessage('changePartnerAvailability')
  changePartnerAvailability(
    @ConnectedSocket() client: Socket,
    @MessageBody() changeAvailabilityData: ChangePartnerAvailabilityDto,
  ) {
    try {
      this.adminService.handleChangePartnerAvailability(
        client.data.name,
        changeAvailabilityData.availability,
      );
      return {
        status: true,
      };
    } catch (error) {
      if (!(error instanceof WsException))
        logger.error(error.message, error.stack);
      client.emit('exception', {
        eventName: 'changePartnerAvailability',
        message: error.message,
      });
      return {
        status: false,
      };
    }
  }

  @SubscribeMessage('acceptPartnerTrip')
  acceptPartnerTrip(
    @ConnectedSocket() client: Socket,
    @MessageBody() tripStateData: TripStateDto,
  ) {
    try {
      this.adminService.handleAcceptPartnerTrip(
        client.data.name,
        tripStateData.vendorID,
        tripStateData.vendorName,
      );
      return {
        status: true,
      };
    } catch (error) {
      if (!(error instanceof WsException))
        logger.error(error.message, error.stack);
      client.emit('exception', {
        eventName: 'acceptPartnerTrip',
        message: error.message,
      });
      return {
        status: false,
      };
    }
  }

  @SubscribeMessage('rejectPartnerTrip')
  rejectPartnerTrip(
    @ConnectedSocket() client: Socket,
    @MessageBody() tripStateData: TripStateDto,
  ) {
    try {
      this.adminService.handleRejectPartnerTrip(
        client.data.name,
        tripStateData.vendorID,
        tripStateData.vendorName,
      );
      return {
        status: true,
      };
    } catch (error) {
      if (!(error instanceof WsException))
        logger.error(error.message, error.stack);
      client.emit('exception', {
        eventName: 'rejectPartnerTrip',
        message: error.message,
      });
      return {
        status: false,
      };
    }
  }

  @SubscribeMessage('pullTrip')
  pullTrip(
    @ConnectedSocket() client: Socket,
    @MessageBody() pullTripData: TripIdDto,
  ) {
    try {
      this.adminService.handlePullTrip(pullTripData.tripID, client.data.name);
      return { status: true };
    } catch (error) {
      if (!(error instanceof WsException))
        logger.error(error.message, error.stack);
      client.emit('exception', {
        eventName: 'pullTrip',
        message: error.message,
      });
      return {
        status: false,
      };
    }
  }

  @SubscribeMessage('cancelTrip')
  cancelTrip(
    @ConnectedSocket() client: Socket,
    @MessageBody() cancelTripData: TripIdDto,
  ) {
    try {
      this.adminService.handleCancelTrip(
        cancelTripData.tripID,
        client.data.name,
      );
      return {
        status: true,
      };
    } catch (error) {
      if (!(error instanceof WsException))
        logger.error(error.message, error.stack);
      client.emit('exception', {
        eventName: 'cancelTrip',
        message: error.message,
      });
      return {
        status: false,
      };
    }
  }

  afterInit(client: Socket) {
    this.adminService.initIO(this.server);
    client.use(this.authMiddleware.adminAuth());
  }
}

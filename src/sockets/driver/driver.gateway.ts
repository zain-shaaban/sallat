import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  OnGatewayInit,
  WsException,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { logger } from 'src/common/error_logger/logger.util';
import { DriverService } from './driver.service';
import { Inject, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  LocationUpdateDto,
  AcceptTripDto,
  AddWayPointDto,
  ChangeStateDto,
  EndTripDto,
  TripIdDto,
  AvailabilityDto,
  CancelTripDto,
} from '../dto/driver.dto';
import { ValidationSocketExceptionFilter } from 'src/common/filters/validation-exception-socket.filter';
import { WsAuthMiddleware } from 'src/common/middlewares/ws-auth.middleware';

@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@UseFilters(ValidationSocketExceptionFilter)
@WebSocketGateway({
  namespace: 'driver',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class DriverSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Namespace;

  constructor(
    @Inject() private driverService: DriverService,
    @Inject() private authMiddleware: WsAuthMiddleware,
  ) {}

  handleConnection(client: Socket) {
    try {
      this.driverService.handleDriverConnection(client);
    } catch (error) {
      logger.error(error.message, error.stack);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    try {
      this.driverService.handleDriverDisconnect(client);
    } catch (error) {
      logger.error(error.message, error.stack);
      client.disconnect();
    }
  }

  @SubscribeMessage('sendLocation')
  handleLocationUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() location: LocationUpdateDto,
  ) {
    try {
      this.driverService.handleNewLocation(client.data.id, location.coords);
      return { status: true };
    } catch (error) {
      if (!(error instanceof WsException))
        logger.error(error.message, error.stack);
      client.emit('exception', {
        eventName: 'sendLocation',
        message: error.message,
      });
      return {
        status: false,
      };
    }
  }

  @SubscribeMessage('acceptTrip')
  caseAcceptTrip(
    @ConnectedSocket() client: Socket,
    @MessageBody() tripStartData: AcceptTripDto,
  ) {
    try {
      this.driverService.handleAcceptTrip(
        client.data.id,
        client.data.name,
        tripStartData.tripID,
        tripStartData.location,
        tripStartData.time,
      );
      return { status: true };
    } catch (error) {
      if (!(error instanceof WsException))
        logger.error(error.message, error.stack);
      client.emit('exception', {
        eventName: 'acceptTrip',
        message: error.message,
      });
      return {
        status: false,
      };
    }
  }

  @SubscribeMessage('rejectTrip')
  caseRejectTrip(
    @ConnectedSocket() client: Socket,
    @MessageBody() rejectTripData: TripIdDto,
  ) {
    try {
      this.driverService.handleRejectTrip(
        client.data.id,
        client.data.name,
        rejectTripData.tripID,
      );
      return { status: true };
    } catch (error) {
      if (!(error instanceof WsException))
        logger.error(error.message, error.stack);
      client.emit('exception', {
        eventName: 'rejectTrip',
        message: error.message,
      });
      return {
        status: false,
      };
    }
  }

  @SubscribeMessage('changeToAlternative')
  changeFromNormalTripToAlternative(
    @ConnectedSocket() client: Socket,
    @MessageBody() changeToAlternative: TripIdDto,
  ) {
    try {
      const trip = this.driverService.handleChangeTripToAlternative(
        client.data.id,
        changeToAlternative.tripID,
        client.data.name,
      );
      return {
        status: true,
        data: trip,
      };
    } catch (error) {
      if (!(error instanceof WsException))
        logger.error(error.message, error.stack);
      client.emit('exception', {
        eventName: 'changetoAlternative',
        message: error.message,
      });
      return {
        status: false,
      };
    }
  }

  @SubscribeMessage('addWayPoint')
  addWayPoints(
    @ConnectedSocket() client: Socket,
    @MessageBody() wayPointData: AddWayPointDto,
  ) {
    try {
      this.driverService.handleNewPoint(
        client.data.id,
        client.data.name,
        wayPointData.wayPoint,
        wayPointData.tripID,
      );
      return { status: true };
    } catch (error) {
      if (!(error instanceof WsException))
        logger.error(error.message, error.stack);
      client.emit('exception', {
        eventName: 'addWayPoint',
        message: error.message,
      });
      return {
        status: false,
      };
    }
  }

  @SubscribeMessage('changeState')
  changeState(
    @ConnectedSocket() client: Socket,
    @MessageBody() changeStateData: ChangeStateDto,
  ) {
    try {
      this.driverService.handleChangeStateOfTheNormalTrip(
        client.data.id,
        client.data.name,
        changeStateData.tripID,
        changeStateData.stateName,
        changeStateData.stateData,
      );
      return { status: true };
    } catch (error) {
      if (!(error instanceof WsException))
        logger.error(error.message, error.stack);
      client.emit('exception', {
        eventName: 'changeState',
        message: error.message,
      });
      return {
        status: false,
      };
    }
  }

  @SubscribeMessage('failTrip')
  failedTrip(
    @ConnectedSocket() client: Socket,
    @MessageBody() cancelTripData: CancelTripDto,
  ) {
    try {
      this.driverService.handleFailedTrip(
        client.data.id,
        client.data.name,
        cancelTripData.tripID,
        cancelTripData.reason,
      );
      return { status: true };
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

  @SubscribeMessage('setAvailable')
  updateDriverAvailability(
    @ConnectedSocket() client: Socket,
    @MessageBody() setAvailableData: AvailabilityDto,
  ) {
    try {
      this.driverService.handleUpdateDriverAvailability(
        client.data.id,
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

  @SubscribeMessage('endTrip')
  async endTrip(
    @ConnectedSocket() client: Socket,
    @MessageBody() endStateData: EndTripDto,
  ) {
    try {
      return await this.driverService.handleEndTrip(
        client.data.id,
        client.data.name,
        endStateData.tripID,
        endStateData.receipt,
        endStateData.itemPrice,
        endStateData.location,
        endStateData.type,
        endStateData.time,
        endStateData.rawPath,
        endStateData.unpaidPath
      );
    } catch (error) {
      if (!(error instanceof WsException))
        logger.error(error.message, error.stack);
      client.emit('exception', {
        eventName: 'endTrip',
        message: error.message,
      });
      return {
        status: false,
      };
    }
  }

  @SubscribeMessage('logout')
  logout(@ConnectedSocket() client: Socket) {
    try {
      this.driverService.handleLogOut(client.data.id, client.data.name);
      return {
        status: true,
      };
    } catch (error) {
      if (!(error instanceof WsException))
        logger.error(error.message, error.stack);
      client.emit('exception', {
        eventName: 'logout',
        message: error.message,
      });
      return {
        status: false,
      };
    }
  }

  @SubscribeMessage('emergencyState')
  emergencyState(@ConnectedSocket() client: Socket) {
    try {
      this.driverService.handleEmergencyState(client.data.id, client.data.name);
      return {
        status: true,
      };
    } catch (error) {
      if (!(error instanceof WsException))
        logger.error(error.message, error.stack);
      client.emit('exception', {
        eventName: 'emergencyState',
        message: error.message,
      });
      return {
        status: false,
      };
    }
  }

  afterInit(client: Socket) {
    this.driverService.initIO(this.server);
    client.use(this.authMiddleware.driverAuth());
  }
}

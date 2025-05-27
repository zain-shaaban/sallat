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
} from '../dto/driver.dto';
import { ValidationSocketExceptionFilter } from 'src/common/filters/validation-exception-socket.filter';

@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@UseFilters(ValidationSocketExceptionFilter)
@WebSocketGateway({
  namespace: 'driver',
  cors: {
    origin: '*',
  },
})
export class DriverSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Namespace;

  constructor(@Inject() private driverService: DriverService) {}

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
      this.driverService.handleNewLocation(
        client.data.driverID,
        location.coords,
        location.clientDate,
      );
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
        client.data.driverID,
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
        client.data.driverID,
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

  @SubscribeMessage('addWayPoint')
  addWayPoints(
    @ConnectedSocket() client: Socket,
    @MessageBody() wayPointData: AddWayPointDto,
  ) {
    try {
      this.driverService.handleNewPoint(
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
        client.data.driverID,
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

  @SubscribeMessage('cancelTrip')
  canselTripByDriver(
    @ConnectedSocket() client: Socket,
    @MessageBody() cancelTripData: TripIdDto,
  ) {
    try {
      this.driverService.handleCancelTrip(
        client.data.driverID,
        cancelTripData.tripID,
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
      console.log(setAvailableData);
      this.driverService.handleUpdateDriverAvailability(
        client.data.driverID,
        setAvailableData.available,
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
        client.data.driverID,
        endStateData.tripID,
        endStateData.receipt,
        endStateData.itemPrice,
        endStateData.location,
        endStateData.type,
        endStateData.time,
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

  afterInit() {
    this.driverService.initIO(this.server);
  }
}

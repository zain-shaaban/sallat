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
import { CoordinatesDto, LocationDto } from 'src/customer/dto/location.dto';
import { Inject } from '@nestjs/common';

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
    @MessageBody()
    location: {
      coords: CoordinatesDto;
      clientDate: number;
    },
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
    @MessageBody()
    tripStartData: { tripID: string; location: LocationDto; time: number },
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
    @MessageBody() tripID: string,
  ) {
    try {
      this.driverService.handleRejectTrip(client.data.driverID, tripID);
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
    @MessageBody()
    {
      wayPoint,
      tripID,
    }: {
      wayPoint: { location: LocationDto; time: number; type: string };
      tripID: string;
    },
  ) {
    try {
      this.driverService.handleNewPoint(wayPoint, tripID);
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
    @MessageBody()
    changeStateData: {
      tripID: string;
      stateName: string;
      stateData: { location: LocationDto; time: number };
    },
  ) {
    try {
      this.driverService.handleChangeStateOfTheNormalTrip(
        client.data.dirverID,
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
    @MessageBody() tripID: string,
  ) {
    try {
      this.driverService.handleCancelTrip(client.data.driverID, tripID);
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
    @MessageBody() available: boolean,
  ) {
    try {
      this.driverService.handleUpdateDriverAvailability(
        client.data.driverID,
        available,
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
    @MessageBody()
    endStateData: {
      tripID: string;
      receipt: { name: string; price: number }[];
      itemPrice: number;
      location: LocationDto;
      type: string;
      time: number;
    },
  ) {
    try {
      await this.driverService.handleEndTrip(
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

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
import { Namespace, Server, Socket } from 'socket.io';
import { Inject } from '@nestjs/common';
import { logger } from 'src/common/error_logger/logger.util';
import { AdminService } from './admin.service';
import { CoordinatesDto } from 'src/customer/dto/location.dto';

@WebSocketGateway({
  namespace: 'admin',
  cors: {
    origin: '*',
  },
})
export class AdminSocketGateway implements OnGatewayConnection, OnGatewayInit {
  @WebSocketServer()
  server: Namespace;

  constructor(@Inject() private readonly adminService: AdminService) {}

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
    @MessageBody()
    receivedData: {
      tripID: string;
      routedPath: CoordinatesDto[];
    },
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
    @MessageBody() idPairs: { tripID: string; driverID: string },
  ) {
    try {
      this.adminService.handleAssignNewDriverToTheTrip(
        idPairs.tripID,
        idPairs.driverID,
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
    @MessageBody() setAvailableData: { available: boolean; driverID: string },
  ) {
    try {
      this.adminService.handleChangeDriverAvailability(
        setAvailableData.driverID,
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

  @SubscribeMessage('pullTrip')
  pullTrip(@ConnectedSocket() client: Socket, @MessageBody() tripID: string) {
    try {
      this.adminService.handlePullTrip(tripID);
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
  cancelTrip(@ConnectedSocket() client: Socket, @MessageBody() tripID: string) {
    try {
      this.adminService.handleCancelTrip(tripID);
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

  afterInit(server: Server) {
    this.adminService.initIO(this.server);
  }
}

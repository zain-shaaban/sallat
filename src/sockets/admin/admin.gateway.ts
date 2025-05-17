import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
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
  server: Server;

  constructor(@Inject() private readonly adminService: AdminService) {}

  handleConnection(client: Socket) {
    try {
      this.adminService.handleAdminConnection(client);
      return { status: true };
    } catch (error) {
      logger.error(error.message, error.stack);
      return {
        status: false,
        message: error.message,
      };
    }
  }

  @SubscribeMessage('resetEnvironment')
  resetServerEnvirnoment() {
    try {
      this.adminService.resetServerEnvironment();
      return { status: true };
    } catch (error) {
      logger.error(error.message, error.stack);
      return {
        status: false,
        message: error.message,
      };
    }
  }

  @SubscribeMessage('assignRoutedPath')
  assignRoutedPath(
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
      logger.error(error.message, error.stack);
      return {
        status: false,
        message: error.message,
      };
    }
  }

  @SubscribeMessage('assignNewDriver')
  assignNewDriver(
    @MessageBody() idPairs: { tripID: string; driverID: string },
  ) {
    try {
      this.adminService.handleAssignNewDriverToTheTrip(
        idPairs.tripID,
        idPairs.driverID,
      );
      return { status: true };
    } catch (error) {
      logger.error(error.message, error.stack);
      return {
        status: false,
        message: error.message,
      };
    }
  }

  @SubscribeMessage('setAvailable')
  updateDriverAvailable(
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
      logger.error(error.message, error.stack);
      return {
        status: false,
        message: error.message,
      };
    }
  }

  @SubscribeMessage('pullTrip')
  pullTrip(@MessageBody() tripID: string) {
    try {
      this.adminService.handlePullTrip(tripID);
      return { status: true };
    } catch (error) {
      logger.error(error.message, error.stack);
      return {
        status: false,
        message: error.message,
      };
    }
  }

  @SubscribeMessage('cancelTrip')
  cancelTrip(@MessageBody() tripID: string) {
    try {
      this.adminService.handleCancelTrip(tripID);
      return {
        status: true,
      };
    } catch (error) {
      logger.error(error.message, error.stack);
      return {
        status: false,
        message: error.message,
      };
    }
  }

  afterInit(server: Server) {
    this.adminService.initIO(this.server);
  }
}

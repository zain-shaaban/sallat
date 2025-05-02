import {
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { onlineDrivers } from '../driver-sokcet/driver-sokcet.gateway';
import { Trip } from 'src/trip/entities/trip.entity';
import { ErrorLoggerService } from 'src/common/error_logger/error_logger.service';
import { Inject, NotFoundException } from '@nestjs/common';
import { NotificationService } from 'src/notification/notification.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationSocket } from '../notification-socket/entites/notification-socket.entity';

export let readyTrips: any[] = [];
export let ongoingTrips: any[] = [];
export let pendingTrips: any[] = [];

@WebSocketGateway({
  namespace: 'admin',
  cors: {
    origin: '*',
  },
})
export class AdminSocketGateway implements OnGatewayConnection {
  @WebSocketServer()
  io: Namespace;

  constructor(
    private readonly logger: ErrorLoggerService,
    @Inject() private readonly notificationService: NotificationService,
    @InjectRepository(NotificationSocket)
    private readonly notificationSocketRepository: Repository<NotificationSocket>,
  ) {}

  handleConnection(client: Socket) {
    try {
      client.emit('onConnection', {
        onlineDrivers,
        readyTrips,
        pendingTrips,
        ongoingTrips,
      });
      return { status: true };
    } catch (error) {
      this.logger.error(error.message, error.stack);
      return {
        status: false,
        message: error.message,
      };
    }
  }

  @SubscribeMessage('resetEnvironment')
  resetAllVariables() {
    try {
      readyTrips.length = 0;
      ongoingTrips.length = 0;
      pendingTrips.length = 0;
      onlineDrivers.length = 0;
      return { status: true };
    } catch (error) {
      this.logger.error(error.message, error.stack);
      return {
        status: false,
        message: error.message,
      };
    }
  }

  @SubscribeMessage('assignRoutedPath')
  assignRoutedPath(@MessageBody() receivedData: any) {
    try {
      const trip = pendingTrips.find(t => t.tripID == receivedData.tripID);
      if(trip) {
        trip.routedPath = receivedData.routedPath;  
        this.sendTripsToAdmins();
      }
      return { status: true };
    } catch (error) {
      this.logger.error(error.message, error.stack);
      return {
        status: false,
        message: error.message,
      };
    }
  }

  @SubscribeMessage('assignNewDriver')
  assignNewDriver(@MessageBody() idPairs: any) {
    try {
      const trip = pendingTrips.find((trip) => trip.tripID == idPairs.tripID);
      if (trip) {
        trip.driverID = idPairs.driverID;
        pendingTrips = pendingTrips.filter(
          (trip) => trip.tripID != idPairs.tripID,
        );
        readyTrips.push(trip);
        this.submitNewTrip(trip);
        this.sendDriversArrayToAdmins();
        this.notificationService.send({
          title: 'رحلة جديدة',
          content: 'اضغط لعرض تفاصيل الرحلة',
          driverID: trip.driverID,
        });
      }
      return { status: true };
    } catch (error) {
      this.logger.error(error.message, error.stack);
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
      let driver = onlineDrivers.find(
        (driver) => driver.driverID == setAvailableData.driverID,
      );
      const isDriverHasAtrip =
        ongoingTrips.find(
          (trip) => trip.driverID === setAvailableData.driverID,
        ) ||
        readyTrips.find((trip) => trip.driverID === setAvailableData.driverID);
      if (!driver || isDriverHasAtrip)
        throw new NotFoundException(
          'the driver not exist or he has a trip now',
        );
      driver.available = setAvailableData.available;
      this.sendDriversArrayToAdmins();
      if (driver.socketID) {
        this.io.server.of('/driver').to(driver.socketID).emit('availabilityChange', driver.available);
      }
      return {
        status: true,
      };
    } catch (error) {
      this.logger.error(error.message, error.stack);
      return {
        status: false,
        message: error.message,
      };
    }
  }

  @SubscribeMessage('pullTrip')
  pullTrip(@MessageBody() tripID: string) {
    try {
      let trip = readyTrips.find((trip) => trip.tripID == tripID);
      if (!trip) throw new NotFoundException();
      let driver = onlineDrivers.find(
        (driver) => driver.driverID == trip.driverID,
      );
      driver.available = true;
      this.notificationService.send({
        title: 'تم سحب الرحلة',
        content: 'كن جاهز لاستقبال رحلة مختلفة',
        driverID: trip.driverID,
      });
      this.tripPulledNotificationForAdmins(trip.tripID, trip.driverID);
      this.moveTripFromReadyToPending(trip);
      this.sendDriversArrayToAdmins();
      this.tripPulledForDriver(driver);
      return { status: true };
    } catch (error) {
      this.logger.error(error.message, error.stack);
      return {
        status: false,
        message: error.message,
      };
    }
  }

  @SubscribeMessage('cancelTrip')
  cancelTrip(@MessageBody() tripID: string) {
    try {
      ongoingTrips = ongoingTrips.filter((trip) => {
        if (trip.tripID == tripID) {
          let driver = onlineDrivers.find(
            (driver) => driver.driverID == trip.driverID,
          );
          if (driver) {
            driver.available = true;
            this.tripCancelledForDriver(driver);
            this.notificationService.send({
              title: 'تم إلغاء الرحلة',
              content: 'الرحلة القائمة لديك تم إلغاؤها',
              driverID: driver.driverID,
            });
          }
          this.tripCancelledNotificationForAdmins(tripID);
          return false;
        }
        return true;
      });
      readyTrips = readyTrips.filter((trip) => {
        if (trip.tripID == tripID) {
          let driver = onlineDrivers.find(
            (driver) => driver.driverID == trip.driverID,
          );
          if (driver) {
            driver.available = true;
            this.tripCancelledForDriver(driver);
            this.notificationService.send({
              title: 'تم إلغاء الرحلة',
              content: 'الرحلة القائمة لديك تم إلغاؤها',
              driverID: driver.driverID,
            });
          }
          this.tripCancelledNotificationForAdmins(tripID);
          return false;
        }
        return true;
      });
      pendingTrips = pendingTrips.filter((trip) => {
        if (trip.tripID == tripID) {
          this.tripCancelledNotificationForAdmins(tripID);
          return false;
        }
        return true;
      });
      this.sendDriversArrayToAdmins();
      this.sendTripsToAdmins();
      return {
        status: true,
      };
    } catch (error) {
      this.logger.error(error.message, error.stack);
      return {
        status: false,
        message: error.message,
      };
    }
  }

  submitNewTrip(trip: Trip) {
    this.sendTripsToAdmins();
    this.sendTripToDriver(trip);
    let driver = onlineDrivers.find(
      (driver) => driver.driverID == trip.driverID && driver.available == true,
    );
    if (driver) driver.available = false;
    this.sendTripReceivedNotification(trip.tripID, trip.driverID);
  }

  sendTripReceivedNotification(tripID, driverID) {
    this.io.server
      .of('/notifications')
      .emit('tripReceived', { tripID, driverID });

    this.notificationSocketRepository.save({
      type: 'tripReceived',
      data: { tripID, driverID },
    });
  }

  sendTripsToAdmins() {
    this.io.server
      .of('/admin')
      .emit('tripUpdate', { readyTrips, pendingTrips, ongoingTrips });
  }

  sendTripToDriver(trip: Trip) {
    const driverID = trip.driverID;
    const driver = onlineDrivers.find(
      (driver) => driver.driverID == driverID && driver.available == true,
    );
    if (this.io.server.of('/driver').sockets.get(driver?.socketID)) {
      this.io.server.of('/driver').to(driver.socketID).emit('newTrip', trip);
    }
  }

  moveTripFromReadyToPending(myTrip: Trip) {
    readyTrips = readyTrips.filter(
      (trip: Trip) => trip.driverID != myTrip.driverID,
    );
    myTrip.driverID = null;
    pendingTrips.push(myTrip);
    this.sendTripsToAdmins();
  }

  moveTripFromReadyToOnGoing(myTrip: Trip) {
    readyTrips = readyTrips.filter(
      (trip: Trip) => trip.tripID != myTrip.tripID,
    );
    ongoingTrips.push(myTrip);
    this.sendTripsToAdmins();
  }

  removeTripFromOnGoing(myTrip: Trip) {
    ongoingTrips = ongoingTrips.filter(
      (trip: Trip) => trip.tripID != myTrip.tripID,
    );
    this.sendTripsToAdmins();
  }
  moveTripFromOngoingToPending(myTrip) {
    ongoingTrips = ongoingTrips.filter(
      (trip) => trip.driverID != myTrip.driverID,
    );
    myTrip.driverID = null;
    myTrip.path = [];
    myTrip.tripState = {};
    pendingTrips.push(myTrip);
    this.sendTripsToAdmins();
  }

  newVendor(vendor) {
    this.io.server.of('/admin').emit('newVendor', vendor);
  }

  newCustomer(customer) {
    this.io.server.of('/admin').emit('newCustomer', customer);
  }

  newDriver(driver) {
    this.io.server.of('/admin').emit('newDriver', driver);
  }

  tripCancelledNotificationForAdmins(tripID: string) {
    this.io.server.of('/notifications').emit('tripCancelled', tripID);
    this.notificationSocketRepository.save({
      type: 'tripCancelled',
      data: tripID,
    });
  }

  tripPulledNotificationForAdmins(tripID: string, driverID: string) {
    this.io.server
      .of('/notifications')
      .emit('tripPulled', { tripID, driverID });
    this.notificationSocketRepository.save({
      type: 'tripPulled',
      data: { tripID, driverID },
    });
  }

  tripCancelledForDriver(driver) {
    this.io.server.of('/driver').to(driver.socketID).emit('tripCancelled');
  }

  tripPulledForDriver(driver) {
    this.io.server.of('/driver').to(driver.socketID).emit('tripPulled');
  }

  deleteVendor(vendorID) {
    this.io.server.of('/admin').emit('deleteVendor', { vendorID });
  }

  deleteCustomer(customerID) {
    this.io.server.of('/admin').emit('deleteCustomer', { customerID });
  }

  deleteDriver(driverID) {
    this.io.server.of('/admin').emit('deleteDriver', { driverID });
  }

  updateVendor(vendor) {
    this.io.server.of('/admin').emit('updateVendor', vendor);
  }

  updateCustomer(customer) {
    this.io.server.of('/admin').emit('updateCustomer', customer);
  }

  updateDriver(driver) {
    this.io.server.of('/admin').emit('updateDriver', driver);
  }

  sendDriversArrayToAdmins() {
    this.io.server.of('/admin').emit('driverConnection', onlineDrivers);
  }

  sendNewLocation(driverID: string, location: object) {
    this.io.server.of('/admin').emit('location', { driverID, location });
  }

  sendHttpLocation(driverID: string, location: object) {
    this.io.server.of('/admin').emit('httpLocation', { driverID, location });
  }

  sendDriverDisconnectNotification(driverID: string) {
    this.io.server.of('/notifications').emit('driverConnection', {
      driverID,
      connection: false,
    });
    this.notificationSocketRepository.save({
      type: 'driverConnection',
      data: {
        driverID,
        connection: false,
      },
    });
  }
}

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import {
  AdminSocketGateway,
  ongoingTrips,
  readyTrips,
} from '../admin-socket/admin-socket.gateway';
import { forwardRef, Inject, NotFoundException } from '@nestjs/common';
import * as polyline from '@mapbox/polyline';
import { getPathLength } from 'geolib';
import { Trip } from 'src/trip/entities/trip.entity';
import { Vendor } from 'src/vendor/entities/vendor.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { ErrorLoggerService } from 'src/common/error_logger/error_logger.service';
import { NotificationService } from 'src/notification/notification.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocationEntity } from 'src/trip/entities/location.entity';

export let onlineDrivers: any[] = [];

let matchedDistance: number;
let matchedPath: object[];

const toCoordsArray = (latlngObject) => {
  return latlngObject.map(({ lat, lng }) => [lat, lng]);
};

function pricing(distance: number) {
  return 5000 + 2 * distance;
}

const mapMatching = async (rawPath) => {
  const polylineFromCoords = polyline.encode(toCoordsArray(rawPath));

  function filterBackslashes(URL: string) {
    return URL.replace(/\\/g, '%5C');
  }

  const matchURL = filterBackslashes(
    `https://osrm.srv656652.hstgr.cloud/match/v1/driving/polyline(${polylineFromCoords})?overview=false`,
  );

  const res = await fetch(matchURL);
  const json = await res.json();
  matchedPath = json.tracepoints
    .filter(Boolean)
    .map((p) => p.location.reverse());
  matchedDistance = getPathLength(
    matchedPath.map((point) => {
      return { latitude: point[0], longitude: point[1] };
    }),
  );
  return pricing(matchedDistance);
};

@WebSocketGateway({
  namespace: 'driver',
  cors: {
    origin: '*',
  },
})
export class DriverSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  io: Namespace;

  constructor(
    @Inject(forwardRef(() => AdminSocketGateway))
    private readonly adminSocketGateway: AdminSocketGateway,
    @InjectRepository(Trip) private readonly tripRepository: Repository<Trip>,
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
    @InjectRepository(LocationEntity)
    private locationRepository: Repository<LocationEntity>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly logger: ErrorLoggerService,
    @Inject() private readonly notificationService: NotificationService,
  ) {
    setInterval(
      async () => {
        let beforeDelete = onlineDrivers.length;
        onlineDrivers = onlineDrivers.filter((driver) => {
          if (
            Date.now() - driver.lastLocation > 1000 * 60 * 45 &&
            driver.socketID == null
          ) {
            this.adminSocketGateway.sendDriverDisconnectNotification(
              driver.driverID,
            );
            return false;
          } else if (
            Date.now() - driver.lastLocation > 1000 * 60 * 15 &&
            driver.socketID == null &&
            driver.notificationSent == false
          ) {
            this.notificationService.send({
              title: 'هل مازلت مستمر بالدوام؟',
              driverID: driver.driverID,
              content: 'اضغط لتحديث الحالة',
            });
            driver.notificationSent = true;
            return true;
          } else {
            return true;
          }
        });
        if (beforeDelete != onlineDrivers.length)
          this.adminSocketGateway.sendDriversArrayToAdmins();
      },
      1000 * 60 * 6,
    );
  }

  handleConnection(client: Socket) {
    try {
      const { driverID, lng, lat } = client.handshake.query;
      let driver = onlineDrivers.find((driver) => driver.driverID == driverID);
      if (!driver) {
        onlineDrivers.push({
          socketID: client.id,
          driverID,
          location: { lng: Number(lng), lat: Number(lat) },
          available:
            ongoingTrips.find((trip) => trip.driverID == driverID) ||
            readyTrips.find((trip) => trip.driverID == driverID)
              ? false
              : true,
          lastLocation: Date.now(),
          notificationSent: false,
        });
        this.adminSocketGateway.sendDriversArrayToAdmins();
        this.io.server
          .of('/notifications')
          .emit('driverConnection', { driverID, connection: true });
        client.emit('onConnection', { available: true });
      } else {
        driver.socketID = client.id;
        driver.location = { lng: Number(lng), lat: Number(lat) };
        driver.lastLocation = Date.now();
        driver.notificationSent = false;
        this.adminSocketGateway.sendDriversArrayToAdmins();
        client.emit('onConnection', { available: driver.available });
      }
      readyTrips.forEach((trip) => {
        if (trip.driverID == driverID) client.emit('alreadyAssignedTrip', trip);
      });
      ongoingTrips.forEach((trip) => {
        if (trip.driverID == driverID) client.emit('alreadyAssignedTrip', trip);
      });
      return { status: true };
    } catch (error) {
      this.logger.error(error.message, error.stack);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    try {
      let driver = onlineDrivers.find((driver) => driver.socketID == client.id);
      if (driver) {
        driver.lastLocation = Date.now();
        driver.socketID = null;
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

  @SubscribeMessage('sendLocation')
  handleLocationUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    sendLocationData: {
      location: { lng: number; lat: number };
      clientDate: number;
    },
  ) {
    try {
      const driverID = this.getDriverID(client);
      this.locationRepository.insert({
        driverID,
        location: sendLocationData.location,
        locationSource: 'socket',
        clientDate: sendLocationData.clientDate,
        serverDate: Date.now(),
      });
      const oneDriver = onlineDrivers.find(
        (driver) => driver.driverID == driverID,
      );
      if (oneDriver) {
        oneDriver.location = sendLocationData.location;
        if (oneDriver.available == false) {
          const oneTrip = ongoingTrips.find(
            (trip) => trip.driverID == oneDriver.driverID,
          );
          if (oneTrip) {
            if (oneTrip.alternative == false) {
              if (typeof oneTrip.tripState.onVendor.time == 'number')
                oneTrip.rawPath.push(sendLocationData.location);
            } else if (oneTrip.alternative == true) {
              if (oneTrip.tripState.wayPoints.length > 0)
                oneTrip.rawPath.push(sendLocationData.location);
            }
          }
        }
        this.io.server.of('/admin').emit('location', {
          driverID: oneDriver.driverID,
          location: sendLocationData.location,
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

  @SubscribeMessage('rejectTrip')
  caseRejectTrip(@ConnectedSocket() client: Socket) {
    try {
      const driverID = this.getDriverID(client);
      const oneTrip = readyTrips.find((trip) => trip.driverID == driverID);
      onlineDrivers = onlineDrivers.map((driver) => {
        if (driver.driverID == driverID) driver.available = true;
        return driver;
      });
      this.adminSocketGateway.sendDriversArrayToAdmins();
      this.adminSocketGateway.moveTripFromReadyToPending(oneTrip);
      this.io.server
        .of('/notifications')
        .emit('tripRejected', { tripID: oneTrip.tripID, driverID });
      return { status: true };
    } catch (error) {
      this.logger.error(error.message, error.stack);
      return {
        status: false,
        message: error.message,
      };
    }
  }

  @SubscribeMessage('acceptTrip')
  caseAcceptTrip(
    @ConnectedSocket() client: Socket,
    @MessageBody() startTripData: any,
  ) {
    try {
      const startTrip = {
        location: startTripData.location,
        time: startTripData.time,
      };
      const driverID = this.getDriverID(client);
      onlineDrivers = onlineDrivers.map((driver) => {
        return driver;
      });
      const trip = readyTrips.find((trip) => trip.driverID == driverID);
      if (trip.alternative == true) {
        trip.tripState = {
          tripStart: startTrip,
          wayPoints: [],
          tripEnd: {},
        };
      } else {
        trip.tripState = {
          tripStart: startTrip,
          onVendor: {},
          leftVendor: {},
          tripEnd: {},
        };
      }
      this.adminSocketGateway.moveTripFromReadyToOnGoing(trip);
      this.io.server
        .of('/notifications')
        .emit('tripAccepted', { tripID: trip.tripID, driverID });
      return { status: true };
    } catch (error) {
      this.logger.error(error.message, error.stack);
      return {
        status: false,
        message: error.message,
      };
    }
  }

  @SubscribeMessage('addWayPoint')
  addWayPoints(
    @ConnectedSocket() client: Socket,
    @MessageBody() wayPoint: any,
  ) {
    try {
      const driverID = this.getDriverID(client);
      const trip = ongoingTrips.find((trip) => trip.driverID == driverID);
      trip.tripState.wayPoints.push({ ...wayPoint });
      trip.rawPath.push(wayPoint.location.coords);
      if (wayPoint.type == 'customer') {
        trip.customer.location.coords = wayPoint.location.coords;
        trip.customer.location.approximate = wayPoint.location.approximate;
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

  @SubscribeMessage('changeState')
  changeState(
    @ConnectedSocket() client: Socket,
    @MessageBody() changeStateData: any,
  ) {
    try {
      const driverID = this.getDriverID(client);
      const trip = ongoingTrips.find((trip) => trip.driverID == driverID);
      if (changeStateData.stateName == 'onVendor') {
        this.io.server.of('/notifications').emit('stateOnVendor', {
          tripID: trip.tripID,
          driverID,
          vendorID: trip.vendor.vendorID,
        });
        if (
          trip.vendor.location.approximate == true &&
          changeStateData.stateData.location.approximate == false
        ) {
          trip.vendor.location.coords =
            changeStateData.stateData.location.coords;
          trip.vendor.location.approximate =
            changeStateData.stateData.location.approximate;
        }
        trip.tripState.onVendor = changeStateData.stateData;
        trip.rawPath.push(changeStateData.stateData.location.coords);
      } else {
        trip.tripState.leftVendor.time = changeStateData.stateData;
        this.io.server.of('/notifications').emit('stateLeftVendor', {
          tripID: trip.tripID,
          driverID,
          vendorID: trip.vendor.vendorID,
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

  // @SubscribeMessage('cancelTrip')
  // canselTripByDriver(@ConnectedSocket() client: Socket) {
  //   try {
  //     const driverID = this.getDriverID(client);
  //     const trip = ongoingTrips.find((trip) => trip.driverID == driverID);
  //     this.adminSocketGateway.moveTripFromOngoingToPending(trip);
  //     onlineDrivers = onlineDrivers.filter(
  //       (driver) => driver.driverID != driverID,
  //     );
  //     client.disconnect();
  //     return { status: true };
  //   } catch (error) {
  //     this.logger.error(error.message, error.stack);
  //     return {
  //       status: false,
  //       message: error.message,
  //     };
  //   }
  // }
  @SubscribeMessage('setAvailable')
  updateDriverAvailable(
    @ConnectedSocket() client: Socket,
    @MessageBody() available: boolean,
  ) {
    try {
      let driver = onlineDrivers.find((driver) => driver.socketID == client.id);
      if (!driver) throw new NotFoundException();
      driver.available = available;
      this.adminSocketGateway.sendDriversArrayToAdmins();
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

  @SubscribeMessage('endTrip')
  async endTrip(
    @ConnectedSocket() client: Socket,
    @MessageBody() endStateData: any,
  ) {
    try {
      let itemPrice = endStateData.itemPrice;
      delete endStateData?.itemPrice;
      const driverID = this.getDriverID(client);
      onlineDrivers = onlineDrivers.map((driver) => {
        if (driver.driverID == driverID && driver.available == false)
          driver.available = true;
        return driver;
      });
      const trip = ongoingTrips.find((trip) => trip.driverID == driverID);
      if (!trip.alternative) {
        if (
          trip.customer.location.approximate == true &&
          endStateData.location.approximate == false
        ) {
          trip.customer.location.approximate =
            endStateData.location.approximate;
          trip.customer.location.coords = endStateData.location.coords;
        }
        trip.tripState.tripEnd = endStateData;
        trip.rawPath.push(endStateData.location.coords);
        trip.time = trip.tripState.tripEnd.time - trip.tripState.tripStart.time;
        try {
          trip.price = await mapMatching(trip.rawPath);
        } catch (error) {
          trip.price = 0;
          matchedPath = [];
          matchedDistance = 0;
        }
        trip.success = true;
        await this.tripRepository.update(trip.tripID, {
          driverID: trip.driverID,
          success: trip.success,
          rawPath: trip.rawPath,
          matchedPath,
          distance: matchedDistance,
          tripState: trip.tripState,
          price: trip.price,
          itemPrice,
          time: trip.time,
        });
        await this.vendorRepository
          .update(trip.vendor.vendorID, { location: trip.vendor.location })
          .then(async ({ affected }) => {
            if (affected == 1) {
              let vendor = await this.vendorRepository.findOneBy({
                vendorID: trip.vendor.vendorID,
              });
              this.adminSocketGateway.updateVendor(vendor);
            }
          });
        await this.customerRepository
          .update(trip.customer.customerID, {
            location: trip.customer.location,
          })
          .then(async ({ affected }) => {
            if (affected == 1) {
              let customer = await this.customerRepository.findOneBy({
                customerID: trip.customer.customerID,
              });
              this.adminSocketGateway.updateCustomer(customer);
            }
          });
        this.adminSocketGateway.removeTripFromOnGoing(trip);
        this.io.server.of('/notifications').emit('tripCompleted', {
          tripID: trip.tripID,
          driverID,
          success: trip.success,
          price: trip.price,
          itemPrice,
          time: trip.time,
          distance: matchedDistance,
        });
        this.adminSocketGateway.sendDriversArrayToAdmins();
        return {
          status: true,
          data: {
            tripID: trip.tripID,
            success: trip.success,
            itemPrice,
            time: trip.time,
            distance: matchedDistance,
            price: trip.price,
          },
        };
      } else {
        if (endStateData.type == 'customer') {
          if (trip.customer.location.approximate == true) {
            trip.customer.location.approximate =
              endStateData.location.approximate;
            trip.customer.location.coords = endStateData.location.coords;
          }
        }
        trip.tripState.tripEnd = endStateData;
        trip.rawPath.push(endStateData.location.coords);
        trip.time = trip.tripState.tripEnd.time - trip.tripState.tripStart.time;
        try {
          trip.price = await mapMatching(trip.rawPath);
        } catch (error) {
          trip.price = 0;
          matchedPath = [];
          matchedDistance = 0;
        }
        trip.success = true;
        await this.tripRepository.update(trip.tripID, {
          driverID: trip.driverID,
          success: trip.success,
          rawPath: trip.rawPath,
          matchedPath,
          distance: matchedDistance,
          tripState: trip.tripState,
          price: trip.price,
          itemPrice,
          time: trip.time,
        });
        await this.customerRepository
          .update(trip.customer.customerID, {
            location: trip.customer.location,
          })
          .then(async ({ affected }) => {
            if (affected == 1) {
              let customer = await this.customerRepository.findOneBy({
                customerID: trip.customer.customerID,
              });
              this.adminSocketGateway.updateCustomer(customer);
            }
          });
        this.adminSocketGateway.removeTripFromOnGoing(trip);
        this.io.server.of('/notifications').emit('tripCompleted', {
          tripID: trip.tripID,
          driverID,
          success: trip.success,
          price: trip.price,
          itemPrice,
          time: trip.time,
          distance: matchedDistance,
        });
        this.adminSocketGateway.sendDriversArrayToAdmins();
        return {
          status: true,
          data: {
            tripID: trip.tripID,
            success: trip.success,
            itemPrice,
            time: trip.time,
            distance: matchedDistance,
            price: trip.price,
          },
        };
      }
    } catch (error) {
      this.logger.error(error.message, error.stack);
      return {
        status: false,
        message: error.message,
      };
    }
  }

  getDriverID(client: Socket) {
    return <string>client.handshake.query.driverID;
  }
}

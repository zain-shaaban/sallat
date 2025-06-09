import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { Namespace, Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Trip } from 'src/trip/entities/trip.entity';
import { Repository } from 'typeorm';
import { Vendor } from 'src/vendor/entities/vendor.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationSocket } from '../notifications/entites/notification-socket.entity';
import { TripService } from 'src/trip/trip.service';
import { IDriver } from './driver.interface';
import { CoordinatesDto, LocationDto } from 'src/customer/dto/location.dto';
import { WsException } from '@nestjs/websockets';
import * as polyline from '@mapbox/polyline';
import { getPathLength } from 'geolib';
import { ConfigService } from '@nestjs/config';
import { ITripInSocketsArray } from 'src/trip/interfaces/trip-socket';
import { AdminService } from '../admin/admin.service';

@Injectable()
export class DriverService {
  private io: Namespace;

  onlineDrivers: IDriver[] = [];

  constructor(
    @Inject(forwardRef(() => AdminService))
    private readonly adminService: AdminService,
    @InjectRepository(Trip) private readonly tripRepository: Repository<Trip>,
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @Inject() private readonly notificationService: NotificationService,
    @InjectRepository(NotificationSocket)
    private readonly notificationSocketRepository: Repository<NotificationSocket>,
    @Inject(forwardRef(() => TripService))
    private readonly tripService: TripService,
    private configService: ConfigService,
  ) {}

  handleDriverConnection(client: Socket) {
    const { driverID, lng, lat } = client.handshake.query;
    client.data.driverID = <string>driverID;
    let driver = this.onlineDrivers.find((d) => d.driverID === driverID);

    if (!driver) {
      this.addDriverToOnlineDriversArray({
        socketID: client.id,
        driverID: <string>driverID,
        location: { lat: Number(lat), lng: Number(lng) },
      });

      this.io.server
        .of('/notifications')
        .emit('driverConnection', { driverID, connection: true });

      this.notificationSocketRepository.save({
        type: 'driverConnection',
        data: { driverID, connection: true },
      });
    } else {
      driver.socketID = client.id;
      driver.notificationSent = false;

      driver.location = { lng: Number(lng), lat: Number(lat) };
      driver.lastLocation = Date.now();

      let alreadyAssignedTrips = [
        ...this.tripService.readyTrips.filter((t) => t.driverID == driverID),
        ...this.tripService.ongoingTrips.filter((t) => t.driverID == driverID),
      ];
      client.emit('alreadyAssignedTrip', { alreadyAssignedTrips });
    }

    this.adminService.sendDriversArrayToAdmins();
    client.emit('onConnection', { available: driver?.available || true });
  }

  handleDriverDisconnect(client: Socket) {
    const driver = this.onlineDrivers.find((d) => d.socketID == client.id);
    if (driver) {
      driver.lastLocation = Date.now();
      driver.socketID = null;
    }
  }

  handleNewLocation(driverID: string, coords: CoordinatesDto) {
    const driver = this.onlineDrivers.find((d) => d.driverID === driverID);

    if (!driver) throw new WsException(`Driver with ID ${driverID} not found`);

    driver.location = coords;

    this.tripService.ongoingTrips.forEach((trip) => {
      if (trip.driverID !== driver.driverID) return;
      if (
        trip.alternative == false &&
        Object.values(trip.tripState?.onVendor).length > 0
      )
        trip.rawPath.push(coords);
      else if (trip.alternative == true && trip.tripState.wayPoints.length > 0)
        trip.rawPath.push(coords);
    });

    this.io.server.of('/admin').emit('location', {
      driverID: driver.driverID,
      location: coords,
    });
  }

  handleAcceptTrip(
    driverID: string,
    tripID: string,
    location: LocationDto,
    time: number,
  ) {
    const trip = this.tripService.readyTrips.find((t) => t.tripID === tripID);

    if (!trip) throw new WsException(`Trip with ID ${tripID} not found`);

    if (trip.alternative) {
      trip.tripState = {
        tripStart: { location, time },
        wayPoints: [],
        tripEnd: {},
      };
    } else {
      trip.tripState = {
        tripStart: { location, time },
        onVendor: {},
        leftVendor: {},
        tripEnd: {},
      };
    }

    this.adminService.moveTripFromReadyToOnGoing(trip);

    this.io.server
      .of('/notifications')
      .emit('tripAccepted', { tripID, driverID });

    this.notificationSocketRepository.save({
      type: 'tripAccepted',
      data: { tripID, driverID },
    });
  }

  handleRejectTrip(driverID: string, tripID: string) {
    const trip = this.tripService.readyTrips.find((t) => t.tripID === tripID);

    if (!trip) throw new WsException(`Trip with ID ${tripID} not found`);

    this.adminService.sendDriversArrayToAdmins();

    this.adminService.moveTripFromReadyToPending(trip);

    this.io.server
      .of('/notifications')
      .emit('tripRejected', { tripID, driverID });

    this.notificationSocketRepository.save({
      type: 'tripRejected',
      data: { tripID, driverID },
    });
  }

  handleNewPoint(
    wayPoint: { location: LocationDto; time: number; type: string },
    tripID: string,
  ) {
    const trip = this.tripService.ongoingTrips.find((t) => t.tripID === tripID);

    if (!trip) throw new WsException(`Trip with ID ${tripID} not found`);

    trip.tripState.wayPoints.push(wayPoint);
    trip.rawPath.push(wayPoint.location.coords);

    if (wayPoint.type == 'customer') {
      trip.customer.location.coords = wayPoint.location.coords;
      trip.customer.location.approximate = wayPoint.location.approximate;
    }
  }

  handleChangeStateOfTheNormalTrip(
    driverID: string,
    tripID: string,
    stateName: string,
    stateData: { location?: LocationDto; time?: number },
  ) {
    const trip = this.tripService.ongoingTrips.find((t) => t.tripID === tripID);

    if (stateName === 'onVendor') {
      this.io.server.of('/notifications').emit('stateOnVendor', {
        tripID,
        driverID,
        vendorID: trip.vendor.vendorID,
      });

      this.notificationSocketRepository.save({
        type: 'stateOnVendor',
        data: {
          tripID: trip.tripID,
          driverID,
          vendorID: trip.vendor.vendorID,
        },
      });

      if (
        trip.vendor.location.approximate == true &&
        stateData.location.approximate == false
      ) {
        trip.vendor.location.coords = stateData.location.coords;
        trip.vendor.location.approximate = false;
        this.vendorRepository.update(trip.vendor.vendorID, {
          location: trip.vendor.location,
        });
        this.adminService.updateVendor(trip.vendor);
      }

      trip.tripState.onVendor = stateData;

      trip.rawPath.push(stateData.location.coords);
      return;
    }
    trip.tripState.leftVendor = stateData;

    this.io.server.of('/notifications').emit('stateLeftVendor', {
      tripID: trip.tripID,
      driverID,
      vendorID: trip.vendor.vendorID,
    });

    this.notificationSocketRepository.save({
      type: 'stateLeftVendor',
      data: {
        tripID,
        driverID,
        vendorID: trip.vendor.vendorID,
      },
    });
  }

  handleCancelTrip(driverID: string, tripID: string) {
    const trip = this.tripService.ongoingTrips.find(
      (t) => t.tripID === tripID && t.driverID === driverID,
    );

    if (!trip) throw new WsException(`Trip with ID ${tripID} not found`);

    this.adminService.moveTripFromOngoingToPending(trip);
  }

  handleUpdateDriverAvailability(driverID: string, availability: boolean) {
    const driver = this.onlineDrivers.find((d) => d.driverID === driverID);

    if (!driver) throw new WsException(`Driver with ID ${driverID} not found`);

    driver.available = availability;

    this.adminService.sendDriversArrayToAdmins();
  }

  async handleEndTrip(
    driverID: string,
    tripID: string,
    receipt: { name: string; price: number }[],
    itemPrice: number,
    location: LocationDto,
    type: string,
    time: number,
  ) {
    const trip = this.tripService.ongoingTrips.find(
      (t) => t.tripID === tripID && t.driverID === driverID,
    );

    if (!trip) throw new WsException(`Trip with ID ${tripID} not found`);

    Object.assign(trip, { itemPrice, receipt, status: 'success' });

    if (!trip.alternative || type === 'customer')
      this.updateCustomerLocation(trip, location);

    trip.tripState.tripEnd = { location, time };

    trip.rawPath.push(location.coords);

    trip.time = trip.tripState.tripEnd.time - trip.tripState.tripStart.time;

    try {
      trip.price = await this.mapMatching(
        trip.rawPath,
        trip.matchedPath,
        trip.distance,
      );
    } catch {
      trip.price = 0;
      trip.matchedPath = [];
      trip.distance = 0;
    }

    this.tripRepository.update(trip.tripID, {
      driverID: trip.driverID,
      status: 'success',
      rawPath: trip.rawPath,
      matchedPath: trip.matchedPath,
      distance: trip.distance,
      tripState: trip.tripState,
      price: trip.price,
      itemPrice,
      time: trip.time,
      receipt,
    });

    this.io.server.of('/notifications').emit('tripCompleted', {
      tripID: trip.tripID,
      driverID,
      status: 'success',
      price: trip.price,
      itemPrice,
      time: trip.time,
      distance: trip.distance,
    });

    this.notificationSocketRepository.save({
      type: 'tripCompleted',
      data: {
        tripID: trip.tripID,
        driverID,
        status: 'success',
        price: trip.price,
        itemPrice,
        time: trip.time,
        distance: trip.distance,
      },
    });

    this.adminService.removeTripFromOnGoing(trip);
    this.adminService.sendDriversArrayToAdmins();

    return {
      status: true,
      data: {
        tripID: trip.tripID,
        status: 'success',
        itemPrice,
        time: trip.time,
        distance: trip.distance,
        price: trip.price,
        receipt,
      },
    };
  }

  private updateCustomerLocation(
    trip: ITripInSocketsArray,
    location: LocationDto,
  ) {
    if (trip.customer.location.approximate && !location.approximate) {
      trip.customer.location.approximate = location.approximate;
      trip.customer.location.coords = location.coords;
      this.customerRepository.update(trip.customer.customerID, {
        location: trip.customer.location,
      });
      this.adminService.updateCustomer(trip.customer);
    }
  }

  private addDriverToOnlineDriversArray(driverData: Partial<IDriver>) {
    this.onlineDrivers.push({
      socketID: driverData.socketID,
      driverID: driverData.driverID,
      location: {
        lat: Number(driverData.location.lat),
        lng: Number(driverData.location.lng),
      },
      available: true,
      lastLocation: Date.now(),
      notificationSent: false,
    });
  }

  @Interval(1000 * 60 * 6)
  private async filterDrivers() {
    let beforeDelete = this.onlineDrivers.length;
    this.onlineDrivers = this.onlineDrivers.filter((driver) => {
      if (this.canDisconnectDriver(driver)) {
        this.adminService.sendDriverDisconnectNotification(driver.driverID);
        return false;
      } else if (this.canSendNotification(driver)) {
        this.notificationService.send({
          title: 'هل مازلت مستمر بالدوام؟',
          driverID: driver.driverID,
          content: 'اضغط لتحديث الحالة',
        });
        driver.notificationSent = true;
      }
      return true;
    });
    if (beforeDelete !== this.onlineDrivers.length)
      this.adminService.sendDriversArrayToAdmins();
  }

  private canDisconnectDriver(driver) {
    const driverHasATrip =
      this.tripService.ongoingTrips.some(
        (trip) => trip.driverID === driver.driverID,
      ) ||
      this.tripService.readyTrips.some(
        (trip) => trip.driverID === driver.driverID,
      );

    return (
      Date.now() - driver.lastLocation > 1000 * 60 * 45 &&
      !driver?.socketID &&
      !driverHasATrip
    );
  }

  private canSendNotification(driver) {
    return (
      Date.now() - driver.lastLocation > 1000 * 60 * 15 &&
      !driver?.socketID &&
      !driver.notificationSent
    );
  }

  public initIO(server: Namespace) {
    this.io = server;
  }

  private toCoordsArray(latlngObject: CoordinatesDto[]): [number, number][] {
    return latlngObject.map(({ lat, lng }) => [lat, lng]);
  }

  private pricing(distance: number) {
    return 5000 + 2 * distance;
  }

  private async mapMatching(
    rawPath: CoordinatesDto[],
    matchedPath: [number, number][],
    matchedDistance: number,
  ) {
    const polylineFromCoords = polyline.encode(this.toCoordsArray(rawPath));

    function filterBackslashes(URL: string) {
      return URL.replace(/\\/g, '%5C');
    }

    const matchURL = filterBackslashes(
      `${this.configService.get<string>('OSRM_LINK')}/polyline(${polylineFromCoords})?overview=false`,
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
    return this.pricing(matchedDistance);
  }
}

import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Namespace, Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Trip } from 'src/trip/entities/trip.entity';
import { Repository } from 'typeorm';
import { Vendor } from 'src/vendor/entities/vendor.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { TripService } from 'src/trip/trip.service';
import { IDriver } from './driver.interface';
import { CoordinatesDto, LocationDto } from 'src/customer/dto/location.dto';
import { WsException } from '@nestjs/websockets';
import * as polyline from '@mapbox/polyline';
import { getPathLength } from 'geolib';
import { ConfigService } from '@nestjs/config';
import { ITripInSocketsArray } from 'src/trip/interfaces/trip-socket';
import { AdminService } from '../admin/admin.service';
import { LogService } from '../logs/logs.service';
import { logger } from 'src/common/error_logger/logger.util';
import { OnlineDrivers } from '../shared-online-drivers/online-drivers';
import { TelegramUserService } from 'src/telegram-user-bot/telegram-user.service';

@Injectable()
export class DriverService {
  private io: Namespace;

  private matchedPath: [number, number][];
  private matchedDistance: number;
  private price: number;

  constructor(
    @Inject(forwardRef(() => AdminService))
    private readonly adminService: AdminService,
    @InjectRepository(Trip) private readonly tripRepository: Repository<Trip>,
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @Inject(forwardRef(() => TripService))
    private readonly tripService: TripService,
    private configService: ConfigService,
    @Inject()
    private readonly logService: LogService,
    @Inject() private readonly onlineDrivers: OnlineDrivers,
    @Inject() private readonly telegramBotService: TelegramUserService,
  ) {}

  handleDriverConnection(client: Socket) {
    const { lng, lat } = client.handshake.query;

    const driverID = client.data.id;

    let driver = this.onlineDrivers.drivers.find(
      (d) => d.driverID === driverID,
    );

    if (!driver) {
      this.addDriverToOnlineDriversArray({
        socketID: client.id,
        driverID: <string>driverID,
        driverName: client.data.name,
        location: { lat: Number(lat), lng: Number(lng) },
      });
    } else {
      driver.socketID = client.id;

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
    const driver = this.onlineDrivers.drivers.find(
      (d) => d.socketID == client.id,
    );
    if (driver) {
      driver.lastLocation = Date.now();
      driver.socketID = null;
    }
  }

  handleNewLocation(driverID: string, coords: CoordinatesDto) {
    const driver = this.onlineDrivers.drivers.find(
      (d) => d.driverID === driverID,
    );

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
    driverName: string,
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

    this.logService.acceptTripLog(driverID, driverName, trip.tripNumber);
  }

  handleRejectTrip(driverID: string, driverName: string, tripID: string) {
    const trip = this.tripService.readyTrips.find((t) => t.tripID === tripID);

    if (!trip) throw new WsException(`Trip with ID ${tripID} not found`);

    this.adminService.sendDriversArrayToAdmins();

    this.adminService.moveTripFromReadyToPending(trip);

    this.logService.rejectTripLog(driverID, driverName, trip.tripNumber);
  }

  handleChangeTripToAlternative(
    driverID: string,
    tripID: string,
    driverName: string,
  ) {
    const trip = this.tripService.ongoingTrips.find(
      (trip) => trip.tripID === tripID && trip.alternative == false,
    );

    if (!trip) throw new WsException(`Trip with ID ${tripID} not found`);

    if (Object.keys(trip.tripState.onVendor).length > 0) {
      const { location, time } = trip.tripState.onVendor;
      delete location?.approximate;
      location.description = trip.vendor.location?.description;
      trip.tripState.wayPoints = [{ type: 'vendor', time, location }];
    }

    const keysToDelete = [
      'routedPath',
      'vendor',
      'approxDistance',
      'approxTime',
      'approxPrice',
    ];

    for (const key of keysToDelete) delete trip[key];
    delete trip.tripState?.onVendor;
    delete trip.tripState?.leftVendor;

    trip.alternative = true;
    this.logService.changeToAlternativeLog(
      driverID,
      driverName,
      trip.tripNumber,
    );
    this.adminService.sendTripsToAdmins();
    return trip;
  }

  handleNewPoint(
    driverID: string,
    driverName: string,
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

    this.logService.addWayPointLog(driverID, driverName, trip.tripNumber);
  }

  handleChangeStateOfTheNormalTrip(
    driverID: string,
    driverName: string,
    tripID: string,
    stateName: string,
    stateData: { location?: LocationDto; time?: number },
  ) {
    const trip = this.tripService.ongoingTrips.find((t) => t.tripID === tripID);

    if (!trip) throw new WsException(`Trip with ID ${tripID} not found`);

    if (stateName === 'onVendor') {
      this.telegramBotService.sendMessageToCustomer(
        trip.customer.customerID,
        'وصل السائق الى المتجر.',
      );
      this.logService.onVendorLog(
        driverID,
        driverName,
        trip.vendor.name,
        trip.tripNumber,
      );
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
    this.telegramBotService.sendMessageToCustomer(
      trip.customer.customerID,
      'غادر السائق المتجر.',
    );
    trip.tripState.leftVendor = stateData;

    this.logService.leftVendorLog(
      driverID,
      driverName,
      trip.vendor.name,
      trip.tripNumber,
    );
  }

  async handleFailedTrip(
    driverID: string,
    driverName: string,
    tripID: string,
    reason: string,
  ) {
    const trip = this.tripService.ongoingTrips.find(
      (t) => t.tripID === tripID && t.driverID === driverID,
    );

    if (!trip) throw new WsException(`Trip with ID ${tripID} not found`);

    this.tripRepository.update(trip.tripID, {
      driverID,
      reason,
    });

    this.logService.failedTripLog(
      driverID,
      driverName,
      trip.tripNumber,
      reason,
    );

    this.adminService.moveTripFromOngoingToPending(trip, reason);
  }

  handleUpdateDriverAvailability(
    driverID: string,
    availability: boolean,
    driverName: string,
  ) {
    const driver = this.onlineDrivers.drivers.find(
      (d) => d.driverID === driverID,
    );

    if (!driver) throw new WsException(`Driver with ID ${driverID} not found`);

    driver.available = availability;

    if (availability)
      this.logService.changeDriverToAvailableByDriverLog(driverID, driverName);
    else
      this.logService.changeDriverToUnAvailableByDriverLog(
        driverID,
        driverName,
      );

    this.adminService.sendDriversArrayToAdmins();
  }

  async handleEndTrip(
    driverID: string,
    driverName: string,
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
      await this.mapMatching(trip.rawPath, trip.vehicleNumber);
      trip.price = this.price;
      trip.distance = this.matchedDistance;
      trip.matchedPath = this.matchedPath;
    } catch (error) {
      logger.error(error.message, error.stack);
      trip.matchedPath = [];
      trip.distance = getPathLength(trip.rawPath);
      trip.price = this.pricing(trip.distance, trip.vehicleNumber);
    }

    if (Object.keys(trip.discounts).length > 0) {
      trip.price = trip.price - trip.price * trip.discounts.delivery;
      itemPrice = itemPrice - itemPrice * trip.discounts.item;
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

    this.logService.endTripLog(
      driverID,
      driverName,
      trip.customer.name,
      trip.tripNumber,
    );

    this.adminService.removeTripFromOnGoing(trip);
    this.adminService.sendDriversArrayToAdmins();

    return {
      status: true,
      data: {
        tripNumber: trip.tripNumber,
        status: 'success',
        itemPrice,
        time: trip.time,
        distance: trip.distance,
        price: trip.price,
        receipt,
      },
    };
  }

  handleLogOut(driverID: string, driverName: string) {
    this.onlineDrivers.drivers = this.onlineDrivers.drivers.filter(
      (d) => d.driverID !== driverID,
    );
    this.adminService.sendDriversArrayToAdmins();
    this.logService.logoutLog(driverName);
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
    this.onlineDrivers.drivers.push({
      socketID: driverData.socketID,
      driverID: driverData.driverID,
      driverName: driverData.driverName,
      location: {
        lat: Number(driverData.location.lat),
        lng: Number(driverData.location.lng),
      },
      available: true,
      lastLocation: Date.now(),
    });
  }

  public initIO(server: Namespace) {
    this.io = server;
  }

  private toCoordsArray(latlngObject: CoordinatesDto[]): [number, number][] {
    return latlngObject.map(({ lat, lng }) => [lat, lng]);
  }

  private pricing(distance: number, vehicleNumber: string) {
    if (vehicleNumber.startsWith('N') || vehicleNumber.startsWith('K')) {
      return 5000 + 2.5 * distance;
    } else if (vehicleNumber.startsWith('T')) {
      return 2000 + 6 * distance;
    } else {
      return 5000 + 2.5 * distance;
    }
  }

  private async mapMatching(rawPath: CoordinatesDto[], vehicleNumber: string) {
    const polylineFromCoords = polyline.encode(this.toCoordsArray(rawPath));
    function filterBackslashes(URL: string) {
      return URL.replace(/\\/g, '%5C');
    }

    const matchURL = filterBackslashes(
      `${this.configService.get<string>('OSRM_LINK')}/polyline(${polylineFromCoords})?overview=false`,
    );
    const res = await fetch(matchURL);
    const json = await res.json();
    this.matchedPath = await json.tracepoints
      .filter(Boolean)
      .map((p) => p.location.reverse());
    this.matchedDistance = getPathLength(
      this.matchedPath.map((point) => {
        return { latitude: point[0], longitude: point[1] };
      }),
    );
    this.price = this.pricing(this.matchedDistance, vehicleNumber);
  }
}

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
import { Account } from 'src/account/entities/account.entity';
import { Interval } from '@nestjs/schedule';

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
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async handleDriverConnection(client: Socket) {
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

    const account = await this.accountRepository.findOne({
      where: { id: driverID },
      relations: ['driverMetadata'],
    });

    this.adminService.sendDriversArrayToAdmins();
    client.emit('onConnection', {
      available: driver?.available || true,
      driverInfo: {
        name: account.name,
        phoneNumber: account.phoneNumber,
        email: account.email,
        assignedVehicleNumber: account.driverMetadata.assignedVehicleNumber,
        code: account.driverMetadata.code,
      },
    });
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
        !Object.values(trip.tripState?.onVendor).length &&
        !trip.tripState?.wayPoints.length
      )
        trip.unpaidPath.push(coords);
      else trip.rawPath.push(coords);
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

    this.logService.addWayPointLog(driverID, driverName, trip.tripNumber,wayPoint.type,wayPoint.location.description);
  }

  handleEmergencyState(driverID: string, driverName: string) {
    this.io.server
      .of('/admin')
      .emit('emergencyState', { driverID, driverName });
    this.logService.emergencyStateLog(driverID, driverName);
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
    rawPath: { lat: number; lng: number }[],
    unpaidPath: { lat: number; lng: number }[],
  ) {
    const trip = this.tripService.ongoingTrips.find(
      (t) => t.tripID === tripID && t.driverID === driverID,
    );

    if (!trip) throw new WsException(`Trip with ID ${tripID} not found`);

    //if (rawPath) trip.rawPath = rawPath;

    //if (unpaidPath) trip.unpaidPath = unpaidPath;

    Object.assign(trip, { itemPrice, receipt, status: 'success' });

    if (!trip.alternative || type === 'customer')
      this.updateCustomerLocation(trip, location);

    trip.tripState.tripEnd = { location, time };

    trip.rawPath.push(location.coords);

    trip.time = trip.tripState.tripEnd.time - trip.tripState.tripStart.time;

    trip.unpaidDistance=getPathLength(trip.unpaidPath)
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
      trip.itemPrice = trip.itemPrice - trip.itemPrice * trip.discounts.item;
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
      receipt: trip.receipt,
      unpaidPath:trip.unpaidPath,
      unpaidDistance:trip.unpaidDistance
    });

    this.logService.endTripLog(
      driverID,
      driverName,
      trip.customer.name,
      trip.tripNumber,
    );

    const message = this.generateReceiptMessage(trip);

    this.telegramBotService.sendMessageToCustomer(
      trip.customer.customerID,
      message,
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
        fixedPrice: trip.fixedPrice,
        receipt,
        discounts: trip.discounts,
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
      return this.decreasedReductionPricing(distance);
    } else if (vehicleNumber.startsWith('T')) {
      return this.roundToNearestThousand(12000 + 5 * distance);
    } else {
      return this.decreasedReductionPricing(distance);
    }
  }

  private decreasedReductionPricing(distance: number) {
    const FIXED_PRICE = 10000;
    let variablePrice = 0;
    let metersLeft = distance;

    const ratesPerKm = {
      1: 2.5,
      2: 2.5,
      3: 2.5,
      4: 2.5,
      5: 2.5,
      6: 2.4,
      7: 2.3,
      8: 2.2,
      9: 2.1,
      10: 2.0,
      11: 1.9,
      12: 1.8,
      13: 1.7,
      14: 1.6,
      15: 1.5
    };

    for (let km = 1; metersLeft > 0; km++) {
        let segmentMeters = Math.min(1000, metersLeft);
        let rate = ratesPerKm[km] ?? 1.5;
        variablePrice += segmentMeters * rate;
        metersLeft -= segmentMeters;
    }

    return this.roundToNearestThousand(FIXED_PRICE + variablePrice);
  }

  private roundToNearestThousand(num: number) {
      return Math.round(num / 1000) * 1000;
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

  private generateReceiptMessage(trip: ITripInSocketsArray) {
    const formatDate = (iso: Date) => {
      const date = new Date(iso);
      date.setHours(date.getHours() + 3);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${day}/${month}/${year} ${hours}:${minutes}${ampm}`;
    };

    const formatPrice = (price: number) =>
      `${Number(this.roundToNearestThousand(price)).toLocaleString('en-US')}sp`;

    const timeDifference = (startTime: number, endTime: number) => {
      const diffInMs = endTime - startTime;
      const totalMinutes = Math.floor(diffInMs / 60000);
      if (totalMinutes < 60) {
        return `${totalMinutes} د`;
      }
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return minutes === 0 ? `${hours} س` : `${hours} س ${minutes} د`;
    };

    const distance = `${Math.round(trip.distance || trip.approxDistance)}m`;

    const duration = timeDifference(
      trip.tripState.tripStart.time,
      trip.tripState.tripEnd.time,
    );

    const receiptItems = trip.receipt
      .map((item) => `- ${item.name}: ${formatPrice(item.price)}`)
      .join('\n');

    const deliveryFee = trip.fixedPrice
      ? formatPrice(trip.fixedPrice)
      : formatPrice(trip.price);
    const deliveryDiscountValue = trip.discounts?.delivery || 0;
    const itemDiscountValue = trip.discounts?.item || 0;

    const total = formatPrice(trip.itemPrice + (trip.fixedPrice ?? trip.price));

    const lines = [
      `شكراً لثقتك.`,
      `فاتورة طلبك في ${formatDate(trip.createdAt)}`,
      `الرحلة #${trip.tripNumber}`,
      `المسافة المقطوعة: ${distance}`,
      `المدة: ${duration}`,
      `اجور التوصيل: ${deliveryFee}`,
    ];

    if (deliveryDiscountValue > 0) {
      lines.push(`حسوم التوصيل: ${deliveryDiscountValue * 100}%`);
    }

    lines.push(`المشتريات:`);
    lines.push(receiptItems);

    if (itemDiscountValue > 0) {
      lines.push(`حسوم الاغراض: ${itemDiscountValue * 100}%`);
    }

    lines.push(`الإجمالي: ${total}`);

    lines.push(
      `
_

تابعنا هون : 
<a href="https://www.facebook.com/sallatsy">فيسبوك</a>  
<a href="https://www.instagram.com/sallatsy">انستاغرام</a>  
<a href="http://t.me/sallatsy">تلغرام</a>

خدمة الزبائن: 0986912912 أو <a href="https://wa.me/963986912912">واتس</a>
للشكاوي أو الاقتراحات: <a href="https://wa.me/963986914914">واتس</a>

سلات.. لعندك وين ما كنت`.trim(),
    );

    return lines.join('\n');
  }

  @Interval(1000 * 60 * 15)
  private handleScheduleTrip() {
    const schedulingTrips = this.tripService.pendingTrips.filter(
      (trip) => trip?.schedulingDate,
    );

    schedulingTrips.map((trip) => {
      console.log(new Date(trip.schedulingDate));
      if (
        trip.schedulingDate - (Date.now() + 3 * 60 * 60 * 1000) <=
        1000 * 60 * 60
      ) {
        if (!trip.alternative)
          this.logService.reminderNormalSchedulingTripLog(
            trip.customer.name,
            trip.vendor.name,
            trip.tripNumber,
            trip.schedulingDate,
          );
        else
          this.logService.reminderAlternativeSchedulingTripLog(
            trip.customer.name,
            trip.tripNumber,
            trip.schedulingDate,
          );
      }
    });
  }
}

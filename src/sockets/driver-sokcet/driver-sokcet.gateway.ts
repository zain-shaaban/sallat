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
import { forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as polyline from '@mapbox/polyline';
import { getPathLength } from 'geolib';
import { Trip } from 'src/trip/entities/trip.entity';
import { Vendor } from 'src/vendor/entities/vendor.entity';
import { Customer } from 'src/customer/entities/customer.entity';

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
    @InjectModel(Trip) private readonly tripModel: typeof Trip,
    @InjectModel(Vendor) private readonly vendorModel: typeof Vendor,
    @InjectModel(Customer) private readonly customerModel: typeof Customer,
  ) {}

  handleConnection(client: Socket) {
    const { driverID, lng, lat } = client.handshake.query;
    onlineDrivers.push({
      socketID: client.id,
      driverID,
      location: { lng: Number(lng), lat: Number(lat) },
      available: true,
    });
    this.io.server.of('/admin').emit('driverConnection', { onlineDrivers });
  }

  handleDisconnect(client: Socket) {
    const driverToDelete = onlineDrivers.find(
      (driver) => driver.socketID == client.id,
    );
    onlineDrivers = onlineDrivers.filter((driver) => driver != driverToDelete);
    this.io.server.of('/admin').emit('driverConnection', { onlineDrivers });
  }

  @SubscribeMessage('sendLocation')
  handleLocationUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() location: { lng: number; lat: number },
  ) {
    const driverID = this.getDriverID(client);
    const oneDriver = onlineDrivers.find(
      (driver) => driver.driverID == driverID,
    );
    if (oneDriver) {
      oneDriver.location = location;
      if (oneDriver.available == false) {
        const oneTrip = ongoingTrips.find(
          (trip) => trip.driverID == oneDriver.driverID,
        );
        oneTrip.rawPath.push(location);
      }
    }
    this.io.server
      .of('/admin')
      .emit('location', { driverID: oneDriver.driverID, location });
  }

  @SubscribeMessage('rejectTrip')
  caseRejectTrip(@ConnectedSocket() client: Socket) {
    const driverID = this.getDriverID(client);
    const oneTrip = readyTrips.find((trip) => trip.driverID == driverID);
    this.adminSocketGateway.moveTripFromReadyToPending(oneTrip);
  }

  @SubscribeMessage('acceptTrip')
  caseAcceptTrip(
    @ConnectedSocket() client: Socket,
    @MessageBody() startTripData: any,
  ) {
    const startTrip = {
      location: startTripData.location,
      time: startTripData.time,
    };
    const driverID = this.getDriverID(client);
    onlineDrivers = onlineDrivers.map((driver) => {
      if (driver.driverID == driverID && driver.available == true)
        driver.available = false;
      return driver;
    });
    const trip = readyTrips.find((trip) => trip.driverID == driverID);
    trip.tripState = {
      startTrip: startTrip,
      onVendor: {},
      leftVendor: {},
      onCustomer: {},
    };
    trip.rawPath.push(startTrip.location.coords);
    this.adminSocketGateway.moveTripFromReadyToOnGoing(trip);
  }

  @SubscribeMessage('changeState')
  changeState(
    @ConnectedSocket() client: Socket,
    @MessageBody() changeStateData: any,
  ) {
    const driverID = this.getDriverID(client);
    const trip = ongoingTrips.find((trip) => trip.driverID == driverID);
    if (changeStateData.stateName == 'onVendor') {
      if (trip.vendor.location.approximate == true) {
        const description = trip.vendor.location.description;
        trip.vendor.location = { ...changeStateData.stateData.location };
        trip.vendor.location.description = description;
      } else if (trip.vendor.location.approximate == false) {
        changeStateData.stateData.location = trip.vendor.location;
      }
      trip.tripState.onVendor = changeStateData.stateData;
      trip.rawPath.push(changeStateData.stateData.location.coords);
    } else trip.tripState.leftVendor.time = changeStateData.stateData;
  }

  @SubscribeMessage('cancelTrip')
  canselTripByDriver(@ConnectedSocket() client: Socket) {
    const driverID = this.getDriverID(client);
    const trip = ongoingTrips.find((trip) => trip.driverID == driverID);
    this.adminSocketGateway.moveTripFromOngoingToPending(trip);
    onlineDrivers = onlineDrivers.filter(
      (driver) => driver.driverID != driverID,
    );
    client.disconnect();
  }

  @SubscribeMessage('endTrip')
  async endTrip(
    @ConnectedSocket() client: Socket,
    @MessageBody() endStateData: any,
  ) {
    let itemPrice = endStateData.itemPrice;
    delete endStateData?.itemPrice;
    const driverID = this.getDriverID(client);
    onlineDrivers = onlineDrivers.map((driver) => {
      if (driver.driverID == driverID && driver.available == false)
        driver.available = true;
      return driver;
    });
    const trip = ongoingTrips.find((trip) => trip.driverID == driverID);
    if (trip.customer.location.approximate == true) {
      trip.customer.location.approximate = endStateData.location.approximate;
      trip.customer.location.coords = endStateData.location.coords;
    } else if (trip.customer.location.approximate == false) {
      endStateData.location = trip.customer.location;
      delete endStateData.location?.description;
    }
    trip.tripState.onCustomer = endStateData;
    delete endStateData.location?.description;
    delete endStateData.location?.approximate;
    trip.rawPath.push(endStateData.location.coords);
    trip.driverID = Number(trip.driverID);
    trip.time = trip.tripState.onCustomer.time - trip.tripState.startTrip.time;
    try {
      trip.price = await mapMatching(trip.rawPath);
    } catch (error) {
      trip.price = null;
      matchedPath = [];
      matchedDistance = null;
    }
    await this.tripModel.update(
      {
        driverID: trip.driverID,
        success: true,
        rawPath: JSON.stringify(trip.rawPath),
        matchedPath: JSON.stringify(matchedPath),
        distance: matchedDistance,
        tripState: JSON.stringify(trip.tripState),
        price: trip.price,
        itemPrice,
        time: trip.time,
      },
      { where: { tripID: trip.tripID } },
    );
    await this.vendorModel.update(
      { location: JSON.stringify(trip.vendor.location) },
      { where: { vendorID: trip.vendor.vendorID } },
    );
    await this.customerModel.update(
      {
        location: JSON.stringify(trip.customer.location),
      },
      { where: { customerID: trip.customer.customerID } },
    );
    this.adminSocketGateway.removeTripFromOnGoing(trip);
  }

  getDriverID(client: Socket) {
    return Number(client.handshake.query.driverID);
  }
}

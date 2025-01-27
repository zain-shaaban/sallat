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
import { Trip } from 'src/trip/entities/trip.entity';
import { Vendor } from 'src/vendor/entities/vendor.entity';
import { Customer } from 'src/customer/entities/customer.entity';

export let onlineDrivers: any[] = [];

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
        oneTrip.path.push(location);
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
    trip.path.push(startTrip.location.coords);
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
        changeStateData.stateData.location.description =
          trip.vendor.location.description;
        trip.vendor.location = changeStateData.stateData.location;
      }
      if (trip.vendor.location.approximate == false) {
        changeStateData.stateData.location = trip.vendor.location;
        delete changeStateData.stateData.location?.description
      }
      trip.tripState.onVendor = changeStateData.stateData;
      delete changeStateData.stateData?.description;
      delete changeStateData.stateData?.approximate;
      trip.path.push(changeStateData.stateData.location.coords);
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
    const driverID = this.getDriverID(client);
    onlineDrivers = onlineDrivers.map((driver) => {
      if (driver.driverID == driverID && driver.available == false)
        driver.available = true;
      return driver;
    });
    const trip = ongoingTrips.find((trip) => trip.driverID == driverID);
    if (trip.customer.location.approximate == true) {
      endStateData.location.description = trip.customer.location.description;
      trip.customer.location = endStateData.location;
    }
    if (trip.customer.location.approximate == false) {
      endStateData.location = trip.customer.location;
      delete endStateData.location?.description
    }
    trip.tripState.onCustomer = endStateData;
    delete endStateData.location?.description;
    delete endStateData.location?.approximate;
    trip.path.push(endStateData.location.coords);
    trip.driverID = Number(trip.driverID);
    await this.tripModel.update(
      {
        driverID: trip.driverID,
        success: true,
        path: trip.path,
        tripState: JSON.stringify(trip.tripState),
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

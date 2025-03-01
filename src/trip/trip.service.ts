import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTripDto } from './dto/create-trip.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Trip } from './entities/trip.entity';
import { Customer } from '../customer/entities/customer.entity';
import { Vendor } from '../vendor/entities/vendor.entity';
import {
  AdminSocketGateway,
  ongoingTrips,
  readyTrips,
} from 'src/sockets/admin-socket/admin-socket.gateway';
import { sendLocationDto } from './dto/new-location.dto';
import {
  DriverSocketGateway,
  onlineDrivers,
} from 'src/sockets/driver-sokcet/driver-sokcet.gateway';

@Injectable()
export class TripService {
  constructor(
    @InjectModel(Trip) private readonly tripModel: typeof Trip,
    @InjectModel(Customer) private readonly customerModel: typeof Customer,
    @InjectModel(Vendor) private readonly vendorModel: typeof Vendor,
    @Inject() private readonly adminGateway: AdminSocketGateway,
    @Inject() private readonly driverGateWay: DriverSocketGateway,
  ) {}

  async createNewTrip(createTripDto: CreateTripDto) {
    let {
      driverID,
      vendorID,
      vendorName,
      vendorPhoneNumber,
      vendorLocation,
      customerID,
      customerName,
      customerPhoneNumber,
      customerLocation,
      itemTypes,
      description,
      approxDistance,
      approxPrice,
      approxTime,
      routedPath,
      alternative,
    } = createTripDto;
    if (!alternative) {
      let customer: Customer;
      let vendor: Vendor;
      if (vendorName || vendorPhoneNumber || vendorLocation) {
        if (vendorID) {
          vendor = await this.updateVendor(
            vendorID,
            vendorName,
            vendorPhoneNumber,
            vendorLocation,
          );
        } else {
          vendor = await this.createNewVendor(
            vendorName,
            vendorPhoneNumber,
            vendorLocation,
          );
        }
      } else vendor = await this.getVendor(vendorID);
      if (customerName || customerPhoneNumber || customerLocation) {
        if (customerID) {
          customer = await this.updateCustomer(
            customerID,
            customerName,
            customerPhoneNumber,
            customerLocation,
          );
        } else {
          customer = await this.createNewCustomer(
            customerName,
            customerPhoneNumber,
            customerLocation,
          );
        }
      } else customer = await this.getCustomer(customerID);

      let trip: any = await this.tripModel.create({
        driverID,
        vendorID: vendor.vendorID,
        customerID: customer.customerID,
        itemTypes: JSON.stringify(itemTypes),
        description,
        approxDistance,
        approxPrice,
        approxTime,
        routedPath: JSON.stringify(routedPath),
        alternative: false,
      });
      trip = trip.toJSON();
      trip.customer = customer.toJSON();
      trip.vendor = vendor.toJSON();
      delete trip.customerID;
      delete trip.vendorID;
      readyTrips.push(trip);
      this.adminGateway.submitNewTrip(trip);
      this.adminGateway.sendDriversArrayToAdmins();
      return { tripID: trip.tripID };
    } else {
      let customer: Customer;
      if (customerName || customerPhoneNumber || customerLocation) {
        if (customerID) {
          customer = await this.updateCustomer(
            customerID,
            customerName,
            customerPhoneNumber,
            customerLocation,
          );
        } else {
          customer = await this.createNewCustomer(
            customerName,
            customerPhoneNumber,
            customerLocation,
          );
        }
      } else customer = await this.getCustomer(customerID);
      let trip: any = await this.tripModel.create({
        driverID,
        customerID: customer.customerID,
        itemTypes: JSON.stringify(itemTypes),
        description,
        alternative: true,
      });
      trip = trip.toJSON();
      trip.customer = customer.toJSON();
      delete trip.customerID;
      readyTrips.push(trip);
      this.adminGateway.submitNewTrip(trip);
      this.adminGateway.sendDriversArrayToAdmins();
      return { tripID: trip.tripID };
    }
  }

  async createNewCustomer(
    customerName: string,
    customerPhoneNumber: string,
    customerLocation: object,
  ) {
    const customer = await this.customerModel.create({
      name: customerName,
      phoneNumber: customerPhoneNumber,
      location: JSON.stringify(customerLocation),
    });
    this.adminGateway.newCustomer(customer);
    return customer;
  }

  async createNewVendor(
    vendorName: string,
    vendorPhoneNumber: string,
    vendorLocation: object,
  ) {
    const vendor = await this.vendorModel.create({
      name: vendorName,
      phoneNumber: vendorPhoneNumber,
      location: JSON.stringify(vendorLocation),
    });
    this.adminGateway.newVendor(vendor);
    return vendor;
  }

  async updateCustomer(
    customerID: number,
    customerName: string,
    customerPhoneNumber: string,
    customerLocation: object,
  ) {
    if (!customerID) throw new NotFoundException();
    const customer = await this.customerModel
      .update(
        {
          name: customerName,
          phoneNumber: customerPhoneNumber,
          location: JSON.stringify(customerLocation),
        },
        { where: { customerID } },
      )
      .then(() => this.customerModel.findByPk(customerID));
    this.adminGateway.updateCustomer(customer);
    return customer;
  }

  async updateVendor(
    vendorID: number,
    vendorName: string,
    vendorPhoneNumber: string,
    vendorLocation: object,
  ) {
    if (!vendorID) throw new NotFoundException();
    const vendor = await this.vendorModel
      .update(
        {
          name: vendorName,
          phoneNumber: vendorPhoneNumber,
          location: JSON.stringify(vendorLocation),
        },
        { where: { vendorID } },
      )
      .then(() => this.vendorModel.findByPk(vendorID));
    this.adminGateway.updateVendor(vendor);
    return vendor;
  }

  async getVendor(vendorID: number) {
    return await this.vendorModel.findByPk(vendorID);
  }

  async getCustomer(customerID: number) {
    return await this.customerModel.findByPk(customerID);
  }

  async findAll() {
    const allTrips = await this.tripModel.findAll();
    return allTrips;
  }

  async customerSearch(phoneNumber: string) {
    const customer = await this.customerModel.findOne({
      attributes: ['customerID', 'name', 'location'],
      where: { phoneNumber },
    });
    if (!customer) throw new NotFoundException();
    return customer;
  }

  async findOne(tripID: number) {
    const trip = await this.tripModel.findByPk(tripID);
    if (!trip) throw new NotFoundException();
    return trip;
  }

  async remove(tripID: number) {
    const deletedTrip = await this.tripModel.destroy({
      where: { tripID },
    });
    if (deletedTrip == 0) throw new NotFoundException();
    return null;
  }

  async sendPingFromDriver(driverID: number) {
    let driver = onlineDrivers.find((driver) => driver.driverID == driverID);
    if (!driver) throw new NotFoundException();
    clearTimeout(driver.timeOutID);
    const timeOutID = setTimeout(() => {
      this.driverGateWay.sendDriverDisconnectNotification(driverID);
      this.adminGateway.sendDriversArrayToAdmins();
    }, 1000 * 5);
    driver.timeOutID = timeOutID;
    return null;
  }

  async sendNewLocation(sendLocationData: sendLocationDto) {
    const { driverID, location } = sendLocationData;
    const oneDriver = onlineDrivers.find(
      (driver) => driver.driverID == driverID,
    );
    if (!oneDriver) throw new NotFoundException();
    oneDriver.location = location;
    if (oneDriver.available == false) {
      const oneTrip = ongoingTrips.find(
        (trip) => trip.driverID == oneDriver.driverID,
      );
      if (oneTrip) {
        if (oneTrip.alternative == false) {
          if (typeof oneTrip.tripState.onVendor.time == 'number')
            oneTrip.rawPath.push(location);
        } else if (oneTrip.alternative == true) {
          if (oneTrip.tripState.wayPoints.length > 0)
            oneTrip.rawPath.push(location);
        }
      }
    }
    this.adminGateway.sendNewLocation(driverID, location);
    return null;
  }
}

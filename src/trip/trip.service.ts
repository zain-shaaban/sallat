import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTripDto } from './dto/create-trip.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Trip } from './entities/trip.entity';
import { Customer } from '../customer/entities/customer.entity';
import { Vendor } from '../vendor/entities/vendor.entity';
import {
  AdminSocketGateway,
  readyTrips,
} from 'src/sockets/admin-socket/admin-socket.gateway';

@Injectable()
export class TripService {
  constructor(
    @InjectModel(Trip) private readonly tripModel: typeof Trip,
    @InjectModel(Customer) private readonly customerModel: typeof Customer,
    @InjectModel(Vendor) private readonly vendorModel: typeof Vendor,
    @Inject() private readonly adminGateway: AdminSocketGateway,
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
    } = createTripDto;
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
    });
    trip = trip.toJSON();
    trip.customer = customer.toJSON();
    trip.vendor = vendor.toJSON();
    delete trip.customerID;
    delete trip.vendorID;
    readyTrips.push(trip);
    this.adminGateway.submitNewTrip(trip);
    return { tripID: trip.tripID };
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
    return vendor;
  }

  async updateCustomer(
    customerID: number,
    customerName: string,
    customerPhoneNumber: string,
    customerLocation: object,
  ) {
    const customer = await this.customerModel.findByPk(customerID);
    if (!customer) throw new NotFoundException();
    await this.customerModel.update(
      {
        name: customerName,
        phoneNumber: customerPhoneNumber,
        location: JSON.stringify(customerLocation),
      },
      { where: { customerID } },
    );
    return customer;
  }

  async updateVendor(
    vendorID: number,
    vendorName: string,
    vendorPhoneNumber: string,
    vendorLocation: object,
  ) {
    const vendor = await this.vendorModel.findByPk(vendorID);
    if (!vendor) throw new NotFoundException();
    await this.vendorModel.update(
      {
        name: vendorName,
        phoneNumber: vendorPhoneNumber,
        location: JSON.stringify(vendorLocation),
      },
      { where: { vendorID } },
    );
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
}

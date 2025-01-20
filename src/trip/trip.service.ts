import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTripDto } from './dto/create-trip.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Trip } from './entities/trip.entity';
import { Customer } from '../customer/entities/customer.entity';
import { Vendor } from '../vendor/entities/vendor.entity';

@Injectable()
export class TripService {
  constructor(
    @InjectModel(Trip) private readonly tripModel: typeof Trip,
    @InjectModel(Customer) private readonly customerModel: typeof Customer,
    @InjectModel(Vendor) private readonly vendorModel: typeof Vendor,
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
    } = createTripDto;
    if (vendorName || vendorPhoneNumber || vendorLocation) {
      if (vendorID) {
        await this.updateVendor(
          vendorID,
          vendorName,
          vendorPhoneNumber,
          vendorLocation,
        );
      } else {
        vendorID = await this.createNewVendor(
          vendorName,
          vendorPhoneNumber,
          vendorLocation,
        );
      }
    }
    if (customerName || customerPhoneNumber || customerLocation) {
      if (customerID) {
        await this.updateCustomer(
          customerID,
          customerName,
          customerPhoneNumber,
          customerLocation,
        );
      } else {
        customerID = await this.createNewCustomer(
          customerName,
          customerPhoneNumber,
          customerLocation,
        );
      }
    }

    const { tripID } = await this.tripModel.create({
      driverID,
      vendorID,
      customerID,
      itemTypes:JSON.stringify(itemTypes),
      description,
      approxDistance,
      approxPrice,
    });
    return { tripID };
  }

  async createNewCustomer(
    customerName: string,
    customerPhoneNumber: string,
    customerLocation: object,
  ) {
    const { customerID } = await this.customerModel.create({
      name:customerName,
      phoneNumber:customerPhoneNumber,
      location:JSON.stringify(customerLocation),
    });
    return customerID;
  }

  async createNewVendor(
    vendorName: string,
    vendorPhoneNumber: string,
    vendorLocation: object,
  ) {
    const { vendorID } = await this.vendorModel.create({
      name:vendorName,
      phoneNumber:vendorPhoneNumber,
      location: JSON.stringify(vendorLocation),
    });
    return vendorID;
  }

  async updateCustomer(
    customerID: number,
    customerName: string,
    customerPhoneNumber: string,
    customerLocation: object,
  ) {
    const customerUpdated = await this.customerModel.update(
      {
        name:customerName,
        phoneNumber:customerPhoneNumber,
        location: JSON.stringify(customerLocation),
      },
      { where: { customerID } },
    );
    if (customerUpdated[0] == 0) throw new NotFoundException();
  }

  async updateVendor(
    vendorID: number,
    vendorName: string,
    vendorPhoneNumber: string,
    vendorLocation: object,
  ) {
    const vendorUpdated = await this.vendorModel.update(
      {
        name:vendorName,
        phoneNumber:vendorPhoneNumber,
        location: JSON.stringify(vendorLocation),
      },
      { where: { vendorID } },
    );
    if (vendorUpdated[0] == 0) throw new NotFoundException();
  }

  async customerSearch(phoneNumber: string) {
    const customer = await this.customerModel.findOne({
      attributes: ['customerID', 'customerName', 'customerLocation'],
      where: { customerPhoneNumber: phoneNumber },
    });
    if (!customer) throw new NotFoundException();
    return customer;
  }
}

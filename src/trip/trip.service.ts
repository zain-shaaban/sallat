import { Injectable } from '@nestjs/common';
import { CreateTripDto } from './dto/create-trip.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Trip } from './entities/trip.entity';
import { Customer } from './entities/customer.entity';
import { VendorOrder } from './entities/vendor-order.entity';

@Injectable()
export class TripService {
  constructor(
    @InjectModel(Trip) private readonly tripModel: typeof Trip,
    @InjectModel(Customer) private readonly customerModel: typeof Customer,
    @InjectModel(VendorOrder) private readonly vendorModel: typeof VendorOrder,
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
      itemTypes,
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
      customerName,
      customerPhoneNumber,
      customerLocation,
    });
    return customerID;
  }

  async createNewVendor(
    vendorName: string,
    vendorPhoneNumber: string,
    vendorLocation: object,
  ) {
    const { vendorID } = await this.vendorModel.create({
      vendorName,
      vendorPhoneNumber,
      vendorLocation,
    });
    return vendorID;
  }

  async updateCustomer(
    customerID: number,
    customerName: string,
    customerPhoneNumver: string,
    customerLocation: object,
  ) {
    await this.customerModel.update(
      { customerName, customerPhoneNumver, customerLocation },
      { where: { customerID } },
    );
  }

  async updateVendor(
    vendorID: number,
    vendorName: string,
    vendorPhoneNumber: string,
    vendorLocation: object,
  ) {
    await this.vendorModel.update(
      { vendorName, vendorPhoneNumber, vendorLocation },
      { where: { vendorID } },
    );
  }
}
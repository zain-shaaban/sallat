import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTripDto } from './dto/create-trip.dto';
import { Trip } from './entities/trip.entity';
import { Customer } from '../customer/entities/customer.entity';
import { Vendor } from '../vendor/entities/vendor.entity';
import {
  AdminSocketGateway,
  ongoingTrips,
  pendingTrips,
  readyTrips,
} from 'src/sockets/admin-socket/admin-socket.gateway';
import { sendLocationDto } from './dto/new-location.dto';
import { onlineDrivers } from 'src/sockets/driver-sokcet/driver-sokcet.gateway';
import { NotificationService } from 'src/notification/notification.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocationEntity } from './entities/location.entity';

@Injectable()
export class TripService {
  constructor(
    @InjectRepository(Trip) private tripRepository: Repository<Trip>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(LocationEntity)
    private locationRepository: Repository<LocationEntity>,
    @InjectRepository(Vendor) private vendorRepository: Repository<Vendor>,
    @Inject() private readonly adminGateway: AdminSocketGateway,
    @Inject() private readonly notificationService: NotificationService,
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

      if (driverID) {
        let trip: any = await this.tripRepository.save({
          driverID,
          vendorID: vendor.vendorID,
          customerID: customer.customerID,
          itemTypes,
          description,
          approxDistance,
          approxPrice,
          approxTime,
          routedPath,
          alternative: false,
        });
        trip.customer = customer;
        trip.vendor = vendor;
        delete trip.customerID;
        delete trip.vendorID;
        readyTrips.push(trip);
        this.adminGateway.submitNewTrip(trip);
        this.adminGateway.sendDriversArrayToAdmins();
        this.notificationService.send({
          title: 'رحلة جديدة',
          content: 'اضغط لعرض تفاصيل الرحلة',
          driverID: trip.driverID,
        });
        return { tripID: trip.tripID };
      } else {
        let trip: any = await this.tripRepository.save({
          vendorID: vendor.vendorID,
          customerID: customer.customerID,
          itemTypes,
          description,
          approxDistance,
          approxPrice,
          approxTime,
          routedPath,
          alternative: false,
        });
        trip.customer = customer;
        trip.vendor = vendor;
        delete trip.customerID;
        delete trip.vendorID;
        pendingTrips.push(trip);
        this.adminGateway.sendTripsToAdmins();
        this.adminGateway.sendDriversArrayToAdmins();
        this.adminGateway.sendTripReceivedNotification(trip.tripID, null);
        return { tripID: trip.tripID };
      }
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
      if (driverID) {
        let trip: any = await this.tripRepository.save({
          driverID,
          customerID: customer.customerID,
          itemTypes,
          description,
          alternative: true,
        });
        trip.customer = customer;
        delete trip.customerID;
        readyTrips.push(trip);
        this.adminGateway.submitNewTrip(trip);
        this.adminGateway.sendDriversArrayToAdmins();
        this.notificationService.send({
          title: 'رحلة جديدة',
          content: 'اضغط لعرض تفاصيل الرحلة',
          driverID: trip.driverID,
        });
        return { tripID: trip.tripID };
      } else {
        let trip: any = await this.tripRepository.save({
          customerID: customer.customerID,
          itemTypes: itemTypes,
          description,
          alternative: true,
        });
        trip.customer = customer;
        delete trip.customerID;
        pendingTrips.push(trip);
        this.adminGateway.sendTripsToAdmins();
        this.adminGateway.sendDriversArrayToAdmins();
        this.adminGateway.sendTripReceivedNotification(trip.tripID, null);
        return { tripID: trip.tripID };
      }
    }
  }

  async createNewCustomer(
    customerName: string,
    customerPhoneNumber: string,
    customerLocation: object,
  ) {
    const customer = await this.customerRepository.save({
      name: customerName,
      phoneNumber: customerPhoneNumber,
      location: customerLocation,
    });
    this.adminGateway.newCustomer(customer);
    return customer;
  }

  async createNewVendor(
    vendorName: string,
    vendorPhoneNumber: string,
    vendorLocation: object,
  ) {
    const vendor = await this.vendorRepository.save({
      name: vendorName,
      phoneNumber: vendorPhoneNumber,
      location: vendorLocation,
    });
    this.adminGateway.newVendor(vendor);
    return vendor;
  }

  async updateCustomer(
    customerID: string,
    customerName: string,
    customerPhoneNumber: string,
    customerLocation: object,
  ) {
    if (!customerID) throw new NotFoundException();
    const customer = await this.customerRepository
      .update(customerID, {
        name: customerName,
        phoneNumber: customerPhoneNumber,
        location: customerLocation,
      })
      .then(() => this.customerRepository.findOneBy({ customerID }));
    this.adminGateway.updateCustomer(customer);
    return customer;
  }

  async updateVendor(
    vendorID: string,
    vendorName: string,
    vendorPhoneNumber: string,
    vendorLocation: object,
  ) {
    if (!vendorID) throw new NotFoundException();
    const vendor = await this.vendorRepository
      .update(vendorID, {
        name: vendorName,
        phoneNumber: vendorPhoneNumber,
        location: vendorLocation,
      })
      .then(() => this.vendorRepository.findOneBy({ vendorID }));
    this.adminGateway.updateVendor(vendor);
    return vendor;
  }

  async getVendor(vendorID: string) {
    return await this.vendorRepository.findOneBy({ vendorID });
  }

  async getCustomer(customerID: string) {
    return await this.customerRepository.findOneBy({ customerID });
  }

  async findAll() {
    const allTrips = await this.tripRepository.find();
    return allTrips;
  }

  async customerSearch(phoneNumber: string) {
    const customer = await this.customerRepository.findOne({
      select: ['customerID', 'name', 'location'],
      where: { phoneNumber },
    });
    if (!customer) throw new NotFoundException();
    return customer;
  }

  async findOne(tripID: string) {
    const trip = await this.tripRepository.findOneBy({ tripID });
    if (!trip) throw new NotFoundException();
    return trip;
  }

  async remove(tripID: string) {
    const { affected } = await this.tripRepository.delete(tripID);
    if (affected == 0) throw new NotFoundException();
    return null;
  }

  async sendNewLocation(sendLocationData: sendLocationDto) {
    const { driverID, location } = sendLocationData;
    await this.locationRepository.insert({ driverID, location });
    this.adminGateway.sendHttpLocation(driverID, location);
    const oneDriver = onlineDrivers.find(
      (driver) => driver.driverID == driverID,
    );
    if (!oneDriver) throw new NotFoundException();
    oneDriver.location = location;
    oneDriver.lastLocation = Date.now();
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

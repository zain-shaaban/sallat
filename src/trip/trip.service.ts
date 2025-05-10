import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTripDto } from './dto/create-trip.dto';
import { Trip } from './entities/trip.entity';
import { Customer } from '../customer/entities/customer.entity';
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
import { ArrayContains, DeepPartial, Repository } from 'typeorm';
import { LocationEntity } from './entities/location.entity';
import { CustomerService } from 'src/customer/customer.service';

@Injectable()
export class TripService {
  constructor(
    @InjectRepository(Trip) private tripRepository: Repository<Trip>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(LocationEntity)
    private locationRepository: Repository<LocationEntity>,
    @Inject() private readonly adminGateway: AdminSocketGateway,
    @Inject() private readonly notificationService: NotificationService,
    @Inject() private readonly customerService: CustomerService,
  ) {}

  async createNewTrip(createTripDto: CreateTripDto) {
    const wasVendorIDProvided = createTripDto.vendorID ? true : false;
    let {
      driverID,
      vendorID,
      vendorName,
      vendorPhoneNumber,
      vendorLocation,
      customerID,
      customerName,
      customerPhoneNumber,
      customerAlternativePhoneNumbers,
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
      let trip: any = await this.tripRepository.save({
        driverID,
        vendor: {
          vendorID,
          phoneNumber: vendorPhoneNumber,
          name: vendorName,
          location: vendorLocation,
        },
        customer: {
          customerID,
          phoneNumbers: [
            customerPhoneNumber,
            ...customerAlternativePhoneNumbers,
          ],
          name: customerName,
          location: customerLocation,
        } as DeepPartial<Customer>,
        itemTypes,
        description,
        approxDistance,
        approxPrice,
        approxTime,
        routedPath,
        alternative: false,
      });
      const { vendorID: ID, phoneNumber, name, location } = trip.vendor;
      trip.vendor = { vendorID: ID, phoneNumber, name, location };
      trip.customer = this.customerService.handlePhoneNumbers(trip.customer);
      if (driverID) {
        readyTrips.push(trip);
        this.adminGateway.submitNewTrip(trip);
        this.adminGateway.sendDriversArrayToAdmins();
        this.notificationService.send({
          title: 'رحلة جديدة',
          content: 'اضغط لعرض تفاصيل الرحلة',
          driverID: trip.driverID,
        });
      } else {
        pendingTrips.push(trip);
        this.adminGateway.sendTripsToAdmins();
        this.adminGateway.sendDriversArrayToAdmins();
      }
      return {
        tripID: trip.tripID,
        vendorID: wasVendorIDProvided ? null : trip.vendor.vendorID,
      };
    } else {
      let trip: any = await this.tripRepository.save({
        driverID,
        customer: {
          customerID,
          phoneNumbers: [
            customerPhoneNumber,
            ...customerAlternativePhoneNumbers,
          ],
          name: customerName,
          location: customerLocation,
        } as DeepPartial<Customer>,
        itemTypes,
        description,
        alternative: true,
      });
      trip.customer = this.customerService.handlePhoneNumbers(trip.customer);
      if (driverID) {
        readyTrips.push(trip);
        this.adminGateway.submitNewTrip(trip);
        this.adminGateway.sendDriversArrayToAdmins();
        this.notificationService.send({
          title: 'رحلة جديدة',
          content: 'اضغط لعرض تفاصيل الرحلة',
          driverID: trip.driverID,
        });
      } else {
        pendingTrips.push(trip);
        this.adminGateway.sendTripsToAdmins();
        this.adminGateway.sendDriversArrayToAdmins();
      }
      return { tripID: trip.tripID };
    }
  }

  async findAll() {
    const allTrips = await this.tripRepository
      .createQueryBuilder('trip')
      .leftJoinAndSelect('trip.customer', 'customer')
      .leftJoin('trip.vendor', 'vendor')
      .addSelect([
        'vendor.vendorID',
        'vendor.name',
        'vendor.phoneNumber',
        'vendor.location',
      ])
      .getMany();
    return allTrips;
  }

  async customerSearch(phoneNumber: string) {
    let allCustomers: any = await this.customerRepository.find({
      select: ['customerID', 'name', 'location', 'phoneNumbers'],
      where: { phoneNumbers: ArrayContains([phoneNumber]) },
    });
    if (allCustomers.length == 0) throw new NotFoundException();
    allCustomers = allCustomers.map((customer) => {
      customer.alternativePhoneNumbers =
        customer.phoneNumbers.filter((n) => n != phoneNumber) || [];
      delete customer.phoneNumbers;
      return customer;
    });
    return allCustomers;
  }

  async findOne(tripID: string) {
    const trip = await this.tripRepository
      .createQueryBuilder('trip')
      .where('trip.tripID = :tripID', { tripID })
      .leftJoinAndSelect('trip.customer', 'customer')
      .leftJoin('trip.vendor', 'vendor')
      .addSelect([
        'vendor.vendorID',
        'vendor.name',
        'vendor.phoneNumber',
        'vendor.location',
      ])
      .getOne();
    if (!trip) throw new NotFoundException();
    return trip;
  }

  async remove(tripID: string) {
    const { affected } = await this.tripRepository.delete(tripID);
    if (affected == 0) throw new NotFoundException();
    return null;
  }

  async sendNewLocation(sendLocationData: sendLocationDto) {
    const { driverID, location, clientDate } = sendLocationData;
    await this.locationRepository.insert({
      driverID,
      location,
      locationSource: 'http',
      clientDate,
      serverDate: Date.now(),
    });
    this.adminGateway.sendHttpLocation(driverID, location);
    const oneDriver = onlineDrivers.find(
      (driver) => driver.driverID == driverID,
    );
    if (!oneDriver) throw new NotFoundException();
    oneDriver.location = location;
    oneDriver.lastLocation = Date.now();
    ongoingTrips.map((trip) => {
      if (trip.driverID == oneDriver.driverID) {
        if (trip.alternative == false) {
          if (typeof trip.tripState.onVendor.time == 'number')
            trip.rawPath.push(location);
        } else if (trip.alternative == true) {
          if (trip.tripState.wayPoints.length > 0) trip.rawPath.push(location);
        }
      }
    });
    this.adminGateway.sendNewLocation(driverID, location);
    return null;
  }
}

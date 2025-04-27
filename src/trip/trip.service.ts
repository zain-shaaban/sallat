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
import { ArrayContains, Repository } from 'typeorm';
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
          phoneNumber: [
            customerPhoneNumber,
            ...customerAlternativePhoneNumbers,
          ],
          name: customerName,
          location: customerLocation,
        },
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
        this.adminGateway.sendTripReceivedNotification(trip.tripID, driverID);
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
          phoneNumber: [
            customerPhoneNumber,
            ...customerAlternativePhoneNumbers,
          ],
          name: customerName,
          location: customerLocation,
        },
        itemTypes,
        description,
        alternative: true,
      });
      if (driverID) {
        readyTrips.push(trip);
        this.adminGateway.submitNewTrip(trip);
        this.adminGateway.sendDriversArrayToAdmins();
        this.adminGateway.sendTripReceivedNotification(trip.tripID, driverID);
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
    const customer: any = await this.customerRepository.findOne({
      select: ['customerID', 'name', 'location', 'phoneNumber'],
      where: { phoneNumber: ArrayContains([phoneNumber]) },
    });
    if (!customer) throw new NotFoundException();
    customer.alternativePhoneNumbers =
      customer.phoneNumber.filter((n) => n != phoneNumber) || [];
    delete customer.phoneNumber;
    return customer;
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

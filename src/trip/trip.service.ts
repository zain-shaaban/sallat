import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTripDto } from './dto/create-trip.dto';
import { Trip } from './entities/trip.entity';
import { Customer } from '../customer/entities/customer.entity';
import { sendLocationDto } from './dto/new-location.dto';
import { NotificationService } from 'src/notification/notification.service';
import { InjectRepository } from '@nestjs/typeorm';
import { ArrayContains, DeepPartial, Repository } from 'typeorm';
import { CustomerService } from 'src/customer/customer.service';
import { ITripInSocketsArray } from './interfaces/trip-socket';
import { AdminService } from 'src/sockets/admin/admin.service';
import { DriverService } from 'src/sockets/driver/driver.service';

@Injectable()
export class TripService {
  public readyTrips: ITripInSocketsArray[] = [];
  public ongoingTrips: ITripInSocketsArray[] = [];
  public pendingTrips: ITripInSocketsArray[] = [];

  constructor(
    @InjectRepository(Trip) private readonly tripRepository: Repository<Trip>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @Inject() private readonly adminService: AdminService,
    @Inject() private readonly driverService: DriverService,
    @Inject() private readonly notificationService: NotificationService,
    @Inject() private readonly customerService: CustomerService,
  ) {}

  async createNewTrip(
    {
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
    }: CreateTripDto,
    ccID: string,
  ) {
    let trip: any = await this.tripRepository.save({
      ccID,
      driverID,
      vendor: !alternative
        ? {
            vendorID,
            phoneNumber: vendorPhoneNumber,
            name: vendorName,
            location: vendorLocation,
          }
        : undefined,
      customer: {
        customerID,
        phoneNumbers: [customerPhoneNumber, ...customerAlternativePhoneNumbers],
        name: customerName,
        location: customerLocation,
      } as DeepPartial<Customer>,
      itemTypes,
      description,
      approxDistance,
      approxPrice,
      approxTime,
      routedPath,
      alternative,
    });

    trip.customer = this.customerService.handlePhoneNumbers(trip.customer);

    driverID
      ? await this.handleSocketsIfTripIsNewAndDriverIdExist(trip)
      : this.handleSocketsIfTripIsNewAndDriverIdNotExist(trip);

    return {
      tripID: trip.tripID,
      vendorID: vendorID ? null : trip.vendor?.vendorID,
    };
  }

  async findAll() {
    const trips = await this.tripRepository.find({
      relations: ['customer', 'vendor'],
    });
    return trips;
  }

  async customerSearch(phoneNumber: string) {
    let customers: any = await this.customerRepository.find({
      where: { phoneNumbers: ArrayContains([phoneNumber]) },
    });
    if (customers.length === 0)
      throw new NotFoundException(
        `Customer with phone number ${phoneNumber} not found`,
      );
    customers = customers.map((customer) => {
      customer.alternativePhoneNumbers =
        customer.phoneNumbers.filter((n) => n !== phoneNumber) || [];
      delete customer.phoneNumbers;
      return customer;
    });
    return customers;
  }

  async findOne(tripID: string) {
    const trip = await this.tripRepository.findOne({
      where: { tripID },
      relations: ['vendor', 'customer'],
    });
    if (!trip) throw new NotFoundException(`trip with ID ${tripID} not found`);
    return trip;
  }

  async remove(tripID: string) {
    const { affected } = await this.tripRepository.delete(tripID);
    if (affected === 0)
      throw new NotFoundException(`Trip with ID ${tripID} not found`);
    return null;
  }

  async sendNewLocation({ driverID, location }: sendLocationDto) {
    this.adminService.sendHttpLocation(driverID, location);

    let driver = this.driverService.onlineDrivers.find(
      (d) => d.driverID === driverID,
    );

    if (!driver)
      throw new NotFoundException(`Driver with ID ${driverID} not exist`);

    driver = { ...driver, location, lastLocation: Date.now() };

    this.ongoingTrips.map((trip) => {
      if (trip.driverID === driver.driverID) {
        if (trip.alternative === false) {
          if (Object.values(trip.tripState.onVendor).length > 0)
            trip.rawPath.push(location);
        } else if (trip.alternative === true) {
          if (trip.tripState.wayPoints.length > 0) trip.rawPath.push(location);
        }
      }
    });

    this.adminService.sendNewLocation(driverID, location);

    return null;
  }

  async handleSocketsIfTripIsNewAndDriverIdExist(trip: ITripInSocketsArray) {
    this.readyTrips.push(trip);
    this.adminService.submitNewTrip(trip);
    this.adminService.sendDriversArrayToAdmins();
    await this.notificationService.send({
      title: 'رحلة جديدة',
      content: 'اضغط لعرض تفاصيل الرحلة',
      driverID: trip.driverID,
    });
  }

  handleSocketsIfTripIsNewAndDriverIdNotExist(trip: ITripInSocketsArray) {
    this.pendingTrips.push(trip);
    this.adminService.sendTripsToAdmins();
    this.adminService.sendDriversArrayToAdmins();
  }
}

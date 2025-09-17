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
import { LogService } from 'src/sockets/logs/logs.service';
import { OnlineDrivers } from 'src/sockets/shared-online-drivers/online-drivers';
import { TelegramUserService } from 'src/telegram-user-bot/telegram-user.service';
import { Vendor } from 'src/vendor/entities/vendor.entity';
import { DriverMetadata } from 'src/account/entities/driverMetadata.entity';
import { AddNoteDto } from './dto/add-note.dto';
import { AccountRole } from 'src/account/enums/account-role.enum';
import { ModerateTripDto } from './dto/moderate-trip.dto';
import { ConfigService } from '@nestjs/config';
import { UpdateTripDto } from './dto/update-trip.dto';

@Injectable()
export class TripService {
  public readyTrips: ITripInSocketsArray[] = [];
  public ongoingTrips: ITripInSocketsArray[] = [];
  public pendingTrips: ITripInSocketsArray[] = [];

  constructor(
    @InjectRepository(Trip) private readonly tripRepository: Repository<Trip>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
    @Inject() private readonly adminService: AdminService,
    @Inject() private readonly onlineDrivers: OnlineDrivers,
    @Inject() private readonly notificationService: NotificationService,
    @Inject() private readonly customerService: CustomerService,
    @Inject() private readonly logService: LogService,
    @Inject() private readonly userBotService: TelegramUserService,
    @InjectRepository(DriverMetadata)
    private readonly driverRepository: Repository<DriverMetadata>,
    private configService: ConfigService,
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
      partner,
      discounts,
      fixedPrice,
      schedulingDate,
    }: CreateTripDto,
    ccID: string,
    ccName: string,
  ) {
    if (driverID)
      var driver = await this.driverRepository.findOneBy({ id: driverID });

    let trip: any = await this.tripRepository.save({
      ccID,
      driverID: driver?.id,
      vehicleNumber: driver?.assignedVehicleNumber,
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
      partner,
      discounts,
      fixedPrice,
      schedulingDate,
    });

    if (!alternative && !vendorID) this.adminService.newVendor(trip.vendor);

    if (!alternative && vendorID) {
      const vendor = await this.vendorRepository.findOneBy({ vendorID });
      trip.vendor = vendor;
      if (vendorName || vendorLocation || vendorPhoneNumber)
        this.adminService.updateVendor(vendor);
    }

    trip.customer = this.customerService.handlePhoneNumbers(trip.customer);

    if (!schedulingDate) {
      this.userBotService.sendMessageToCustomer(
        trip.customer.customerID,
        'تم تسجيل رحلة جديدة باسمك.',
      );
      driverID
        ? this.handleSocketsIfTripIsNewAndDriverIdExist(trip, ccName)
        : this.handleSocketsIfTripIsNewAndDriverIdNotExist(trip, ccName);
    } else {
      this.userBotService.sendMessageToCustomer(
        trip.customer.customerID,
        ` تم تسجيل رحلة جديدة باسمك بتاريخ ${this.logService.formatDate(schedulingDate)}`,
      );
      this.handleSchedulingTrip(trip, ccName);
    }

    return {
      tripID: trip.tripID,
      vendorID: vendorID ? null : trip.vendor?.vendorID,
    };
  }

  async moderateTrip(moderateTripDto: ModerateTripDto, ccName: string) {
    const { customerID,vendorID,...otherFields } = moderateTripDto;
    const trip = await this.tripRepository.save({
      customer: customerID?{customerID}:null,
      vendor: vendorID?{vendorID}:null,
      status: 'added',
      ...otherFields,
    });

    this.logService.moderateTripLog(ccName, trip.tripNumber);

    return { tripID: trip.tripID, tripNumber: trip.tripNumber };
  }

  async updateTrip(
    tripID: string,
    updateTripDto: UpdateTripDto,
    ccName: string,
  ) {
    const { affected } = await this.tripRepository.update(
      tripID,
      updateTripDto,
    );

    if (!affected)
      throw new NotFoundException(`trip with ID ${tripID} not found`);

    return null;
  }

  async findAll(accountID: string, role: string) {
    if (role == AccountRole.CC) {
      const trips = await this.tripRepository.find({
        where: { ccID: accountID },
        relations: ['customer', 'vendor'],
        order: {
          createdAt: 'desc',
        },
        take: 50
      });
      return {
        trips,
        bms: {
          username: this.configService.get('BMS_USERNAME'),
          password: this.configService.get('BMS_PASSWORD'),
        },
      };
    }
    const trips = await this.tripRepository.find({
      relations: ['customer', 'vendor'],
      order: {
        createdAt: 'desc',
      },
    });
    return {
      trips,
      bms: {
        username: this.configService.get('BMS_USERNAME'),
        password: this.configService.get('BMS_PASSWORD'),
      },
    };
  }

  async customerSearch(phoneNumber: string) {
    let customers: any = await this.customerRepository.find({
      where: { phoneNumbers: ArrayContains([phoneNumber]) },
      relations: {
        trips: {
          vendor: true,
        },
      },
      order: {
        trips: {
          createdAt: 'desc',
        },
      },
    });

    if (customers.length === 0)
      throw new NotFoundException(
        `Customer with phone number ${phoneNumber} not found`,
      );
    customers = customers.map((customer) => {
      customer.alternativePhoneNumbers =
        customer.phoneNumbers.filter((n) => n !== phoneNumber) || [];
      delete customer.phoneNumbers;

      const previousTrip = customer.trips[0];
      customer.previousTrip = previousTrip;
      delete customer.trips;
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

  async addNoteToTheTrip({ tripID, note }: AddNoteDto, adminName: string) {
    const trip = await this.tripRepository.findOneBy({ tripID });

    if (!trip) throw new NotFoundException(`Trip with ID ${tripID} not found`);

    this.tripRepository.update(tripID, { note });

    this.logService.addNoteToTheTripLog(adminName, trip.tripNumber);
    return null;
  }

  async sendNewLocation({ location }: sendLocationDto, driverID: string) {
    this.adminService.sendHttpLocation(driverID, location);

    let driver = this.onlineDrivers.drivers.find(
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

  handleSocketsIfTripIsNewAndDriverIdExist(
    trip: ITripInSocketsArray,
    ccName: string,
  ) {
    this.readyTrips.push(trip);
    this.adminService.submitNewTrip(trip);
    this.adminService.sendDriversArrayToAdmins();

    const driverName = this.onlineDrivers.drivers.find(
      (d) => d.driverID === trip.driverID,
    )?.driverName;

    if (!trip.alternative) {
      this.logService.createNewNormalTripWithDriverLog(
        ccName,
        trip.customer.name,
        trip.tripNumber,
        trip.vendor.name,
        trip.driverID,
        driverName,
      );
    } else {
      this.logService.createNewAlternativeTripWithDriverLog(
        ccName,
        trip.customer.name,
        trip.tripNumber,
        trip.driverID,
        driverName,
      );
    }
    this.notificationService.send({
      title: 'رحلة جديدة',
      content: 'اضغط لعرض تفاصيل الرحلة',
      driverID: trip.driverID,
    });
  }

  handleSocketsIfTripIsNewAndDriverIdNotExist(
    trip: ITripInSocketsArray,
    ccName: string,
  ) {
    if (!trip.alternative) {
      this.logService.createNewNormalTripWithoutDriverLog(
        ccName,
        trip.customer.name,
        trip.tripNumber,
        trip.vendor.name,
      );
    } else {
      this.logService.createNewAlternativeTripWithoutDriverLog(
        ccName,
        trip.customer.name,
        trip.tripNumber,
      );
    }
    this.pendingTrips.push(trip);
    this.adminService.sendTripsToAdmins();
    this.adminService.sendDriversArrayToAdmins();
  }

  handleSchedulingTrip(trip: ITripInSocketsArray, ccName) {
    if (!trip.alternative) {
      this.logService.createNewSchedulingNormalTripLog(
        ccName,
        trip.customer.name,
        trip.tripNumber,
        trip.vendor.name,
        trip.schedulingDate,
      );
    } else {
      this.logService.createNewSchedulingAlternativeTripLog(
        ccName,
        trip.customer.name,
        trip.tripNumber,
        trip.schedulingDate,
      );
    }
    this.pendingTrips.push(trip);
    this.adminService.sendTripsToAdmins();
    this.adminService.sendDriversArrayToAdmins();
  }
}

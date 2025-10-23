import { Injectable } from '@nestjs/common';
import { GetTripsQueryDTO } from './dto/get-trips-query.dto';
import { GetCustomersQueryDTO } from './dto/get-customers-query.dto';
import { GetVendorsQueryDTO } from './dto/get-vendors-query.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Vendor } from 'src/vendor/entities/vendor.entity';
import { Repository } from 'typeorm';
import { Customer } from 'src/customer/entities/customer.entity';
import { Trip } from 'src/trip/entities/trip.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Trip) private readonly tripRepository: Repository<Trip>,
  ) {}

  async getTripStatistics(tripStatisticsQuery: GetTripsQueryDTO) {
    const trips = this.tripRepository.createQueryBuilder('trip');

    if (tripStatisticsQuery.ccID) {
      tripStatisticsQuery.ccID.toLowerCase() !== 'null'
        ? trips.where('trip.ccID = :ccID', { ccID: tripStatisticsQuery.ccID })
        : trips.where('trip.ccID IS NULL');
    }

    if (tripStatisticsQuery.createdAtStart) {
      trips.andWhere('trip.createdAt >= :createdAtStart', {
        createdAtStart: tripStatisticsQuery.createdAtStart,
      });
    }

    if (tripStatisticsQuery.createdAtEnd) {
      trips.andWhere('trip.createdAt <= :createdAtEnd', {
        createdAtEnd: tripStatisticsQuery.createdAtEnd,
      });
    }

    if (tripStatisticsQuery.vendorID) {
      tripStatisticsQuery.vendorID.toLowerCase() !== 'null'
        ? trips.andWhere('trip.vendorID = :vendorID', {
            vendorID: tripStatisticsQuery.vendorID,
          })
        : trips.andWhere('trip.vendorID IS NULL');
    }

    if (tripStatisticsQuery.customerID) {
      tripStatisticsQuery.customerID.toLowerCase() !== 'null'
        ? trips.andWhere('trip.customerID = :customerID', {
            customerID: tripStatisticsQuery.customerID,
          })
        : trips.andWhere('trip.customerID IS NULL');
    }

    if (tripStatisticsQuery.driverID) {
      tripStatisticsQuery.driverID.toLowerCase() !== 'null'
        ? trips.andWhere('trip.driverID = :driverID', {
            driverID: tripStatisticsQuery.driverID,
          })
        : trips.andWhere('trip.driverID IS NULL');
    }

    if (tripStatisticsQuery.alternative) {
      trips.andWhere('trip.alternative = :alternative', {
        alternative: tripStatisticsQuery.alternative,
      });
    }

    if (tripStatisticsQuery.partner) {
      trips.andWhere('trip.partner = :partner', {
        partner: tripStatisticsQuery.partner,
      });
    }

    if (tripStatisticsQuery.isSMSSend) {
      trips.andWhere('trip.isSMSSend', {
        isSMSSend: tripStatisticsQuery.isSMSSend,
      });
    }

    if (tripStatisticsQuery.vehicleNumber) {
      tripStatisticsQuery.vehicleNumber.toLowerCase() !== 'null'
        ? trips.andWhere('trip.vehicleNumber = :vehicleNumber', {
            vehicleNumber: tripStatisticsQuery.vehicleNumber,
          })
        : trips.andWhere('trip.vehicleNumber IS NULL');
    }

    if (tripStatisticsQuery.priceStart) {
      trips.andWhere('COALESCE(trip.fixedPrice,trip.price) >= :priceStart', {
        priceStart: tripStatisticsQuery.priceStart,
      });
    }

    if (tripStatisticsQuery.priceEnd) {
      trips.andWhere('COALESCE(trip.fixedPrice,trip.price) <= :priceEnd', {
        priceEnd: tripStatisticsQuery.priceEnd,
      });
    }

    if (tripStatisticsQuery.discounts) {
      trips.andWhere('trip.discounts IS NOT NULL');
    }

    if (tripStatisticsQuery.fixedPrice) {
      trips.andWhere('trip.fixedPrice IS NOT NULL');
    }

    if (tripStatisticsQuery.schedulingDate) {
      trips.andWhere('trip.schedulingDate IS NOT NULL');
    }

    if (tripStatisticsQuery.note) {
      trips.andWhere('trip.note IS NOT NULL');
    }

    if (tripStatisticsQuery.status) {
      trips.andWhere('trip.status = :status', {
        status: tripStatisticsQuery.status,
      });
    }

    if (tripStatisticsQuery.timeStart) {
      trips.andWhere('trip.time >= :timeStart', {
        timeStart: tripStatisticsQuery.timeStart,
      });
    }

    if (tripStatisticsQuery.timeEnd) {
      trips.andWhere('trip.time <= :timeEnd', {
        timeEnd: tripStatisticsQuery.timeEnd,
      });
    }

    if (
      tripStatisticsQuery.itemTypes &&
      tripStatisticsQuery.itemTypes?.length
    ) {
      trips.andWhere('trip.itemTypes @> :itemTypes::jsonb', {
        itemTypes: JSON.stringify(tripStatisticsQuery.itemTypes),
      });
    }

    trips.orderBy(
      `trip.${tripStatisticsQuery.sortBy}`,
      tripStatisticsQuery.order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
    );

    trips.skip((tripStatisticsQuery.page - 1) * tripStatisticsQuery.limit);

    trips.take(tripStatisticsQuery.limit);

    trips.leftJoinAndSelect('trip.vendor', 'vendor');
    trips.leftJoinAndSelect('trip.customer', 'customer');

    trips.select([
      'trip',
      'vendor.vendorID',
      'vendor.phoneNumber',
      'vendor.name',
      'vendor.partner',
      'vendor.location',
      'customer.customerID',
      'customer.name',
      'customer.phoneNumbers',
      'customer.location',
    ]);

    const [data, total] = await trips.getManyAndCount();
    return { trips: data, total };
  }

  async getCustomerStatistics(customerStatisticsQuery: GetCustomersQueryDTO) {
    const customers = this.customerRepository.createQueryBuilder('customer');

    if (customerStatisticsQuery.name) {
      customers.where('customer.name LIKE :name', {
        name: `%${customerStatisticsQuery.name}%`,
      });
    }

    if (customerStatisticsQuery.phoneNumber) {
      customers.andWhere(':phoneNumber = ANY(customer.phoneNumbers)', {
        phoneNumber: customerStatisticsQuery.phoneNumber,
      });
    }

    customers.orderBy(
      `customer.${customerStatisticsQuery.sortBy}`,
      customerStatisticsQuery.order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
    );

    customers.skip(
      (customerStatisticsQuery.page - 1) * customerStatisticsQuery.limit,
    );

    customers.take(customerStatisticsQuery.limit);

    customers.select([
      'customer.customerID',
      'customer.name',
      'customer.phoneNumbers',
      'customer.location',
      'customer.createdAt',
    ]);

    const [data, total] = await customers.getManyAndCount();
    return { customers: data, total };
  }

  async getVendorStatistics(vendorStatisticsQuery: GetVendorsQueryDTO) {
    const vendors = this.vendorRepository.createQueryBuilder('vendor');

    if (vendorStatisticsQuery.name) {
      vendors.where('vendor.name LIKE :name', {
        name: `%${vendorStatisticsQuery.name}%`,
      });
    }

    if (vendorStatisticsQuery.phoneNumber) {
      vendors.andWhere('vendor.phoneNumber = :phoneNumber', {
        phoneNumber: vendorStatisticsQuery.phoneNumber,
      });
    }

    vendors.orderBy(
      `vendor.${vendorStatisticsQuery.sortBy}`,
      vendorStatisticsQuery.order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
    );

    vendors.skip(
      (vendorStatisticsQuery.page - 1) * vendorStatisticsQuery.limit,
    );

    vendors.take(vendorStatisticsQuery.limit);

    vendors.select([
      'vendor.vendorID',
      'vendor.phoneNumber',
      'vendor.name',
      'vendor.partner',
      'vendor.location',
      'vendor.createdAt',
    ]);

    const [data, total] = await vendors.getManyAndCount();
    return { vendors: data, total };
  }
}

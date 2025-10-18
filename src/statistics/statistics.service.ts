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

    trips.orderBy(
      `trip.${tripStatisticsQuery.sortBy}`,
      tripStatisticsQuery.order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
    );

    trips.skip((tripStatisticsQuery.page - 1) * tripStatisticsQuery.limit);

    trips.take(tripStatisticsQuery.limit);

    const [data, total] = await trips.getManyAndCount();
    return { trips: data, total };
  }

  async getCustomerStatistics(customerStatisticsQuery: GetCustomersQueryDTO) {
    const customers = this.customerRepository.createQueryBuilder('customer');

    customers.orderBy(
      `customer.${customerStatisticsQuery.sortBy}`,
      customerStatisticsQuery.order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
    );

    customers.skip(
      (customerStatisticsQuery.page - 1) * customerStatisticsQuery.limit,
    );

    customers.take(customerStatisticsQuery.limit);

    const [data, total] = await customers.getManyAndCount();
    return { customers: data, total };
  }

  async getVendorStatistics(vendorStatisticsQuery: GetVendorsQueryDTO) {
    const vendors = this.vendorRepository.createQueryBuilder('vendor');

    vendors.orderBy(
      `vendor.${vendorStatisticsQuery.sortBy}`,
      vendorStatisticsQuery.order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
    );

    vendors.skip(
      (vendorStatisticsQuery.page - 1) * vendorStatisticsQuery.limit,
    );

    vendors.take(vendorStatisticsQuery.limit);

    const [data, total] = await vendors.getManyAndCount();
    return { vendors: data, total };
  }
}

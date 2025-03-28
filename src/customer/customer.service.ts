import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDtoRequest } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Trip } from 'src/trip/entities/trip.entity';
import { AdminSocketGateway } from 'src/sockets/admin-socket/admin-socket.gateway';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Trip) private tripRepository: Repository<Trip>,
    @Inject() private readonly adminGateway: AdminSocketGateway,
  ) {}

  async create(createCustomerDto: CreateCustomerDtoRequest) {
    let { name, phoneNumber, location } = createCustomerDto;
    const customer = await this.customerRepository.save({
      name,
      phoneNumber,
      location,
    });
    this.adminGateway.newCustomer(customer);
    return { customerID: customer.customerID };
  }

  async findAll() {
    let allCustomers: any = await this.customerRepository.find();
    for (let i in allCustomers) {
      const trips: any = await this.tripRepository.find({
        where: { customerID: allCustomers[i].customerID },
      });
      allCustomers[i].trips = trips;
    }
    return allCustomers;
  }

  async findOne(customerID: string) {
    let customer: any = await this.customerRepository.findOneBy({ customerID });
    if (!customer) throw new NotFoundException();
    const trips: any = await this.tripRepository.find({
      where: { customerID: customer.customerID },
    });
    customer.trips = trips;
    return customer;
  }

  async update(customerID: string, updateCustomerDto: UpdateCustomerDto) {
    let { name, phoneNumber, location } = updateCustomerDto;
    const customer = await this.customerRepository
      .update(customerID, { name, phoneNumber, location })
      .then((data) => {
        if (data[0] == 0) throw new NotFoundException();
        return this.customerRepository.findOneBy({ customerID });
      });
    this.adminGateway.updateCustomer(customer);
    return null;
  }

  async remove(customerID: string) {
    const { affected } = await this.customerRepository.delete(customerID);
    if (affected == 0) throw new NotFoundException();
    this.adminGateway.deleteCustomer(customerID);
    return null;
  }

  async findOnMap() {
    const allCustomersOnMap = await this.customerRepository.find({
      select: ['customerID', 'name', 'location'],
    });
    return allCustomersOnMap;
  }
}

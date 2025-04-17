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
    let customer = await this.customerRepository.save({
      name,
      phoneNumber: [phoneNumber],
      location,
    });
    customer = this.handlePhoneNumbers(customer);
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
      allCustomers[i] = this.handlePhoneNumbers(allCustomers[i]);
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
    customer = this.handlePhoneNumbers(customer);
    return customer;
  }

  async update(customerID: string, updateCustomerDto: UpdateCustomerDto) {
    let { name, phoneNumber, location } = updateCustomerDto;
    let customer = await this.customerRepository.findOneBy({ customerID });
    if (!customer) throw new NotFoundException('Customer not found');

    if (phoneNumber && !customer.phoneNumber.includes(phoneNumber))
      customer.phoneNumber.push(phoneNumber);

    let updates = Object.fromEntries(
      Object.entries({ name, location }).filter(
        ([_, value]) => value !== undefined,
      ),
    );
    Object.assign(customer, updates);
    await this.customerRepository.save(customer);
    customer = this.handlePhoneNumbers(customer);
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

  handlePhoneNumbers(customer: any) {
    const phoneNumbers = customer.phoneNumber;
    customer.phoneNumber = phoneNumbers[0];
    customer.alternativePhoneNumbers = phoneNumbers.slice(1);
    return customer;
  }
}

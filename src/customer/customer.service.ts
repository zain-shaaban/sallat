import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDtoRequest } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminService } from 'src/sockets/admin/admin.service';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @Inject() private readonly adminService: AdminService,
  ) {}

  async create({ name, phoneNumbers, location }: CreateCustomerDtoRequest) {
    let customer: any = await this.customerRepository.save({
      name,
      phoneNumbers,
      location,
    });
    customer = this.handlePhoneNumbers(customer);
    this.adminService.newCustomer(customer);
    return { customerID: customer.customerID };
  }

  async findAll() {
    let customers: any = await this.customerRepository.find();
    customers = customers.map(this.handlePhoneNumbers);
    return customers;
  }

  async findOne(customerID: string) {
    let customer: any = await this.customerRepository.findOneBy({ customerID });
    if (!customer)
      throw new NotFoundException(`Customer with ID ${customerID} not found`);
    customer = this.handlePhoneNumbers(customer);
    return customer;
  }

  async update(
    customerID: string,
    { name, phoneNumbers, location, note }: UpdateCustomerDto,
  ) {
    let customer: any = await this.customerRepository.findOneBy({ customerID });
    if (!customer)
      throw new NotFoundException(`Customer with ID ${customerID} not found`);

    let updates = Object.fromEntries(
      Object.entries({ name, phoneNumbers, location, note }).filter(
        ([_, value]) => value !== undefined,
      ),
    );
    Object.assign(customer, updates);
    await this.customerRepository.save(customer);
    customer = this.handlePhoneNumbers(customer);
    this.adminService.updateCustomer(customer);
    return null;
  }

  async remove(customerID: string) {
    const { affected } = await this.customerRepository.delete(customerID);
    if (affected == 0)
      throw new NotFoundException(`Customer with ID ${customerID} not found`);
    this.adminService.deleteCustomer(customerID);
    return null;
  }

  async findOnMap() {
    const customersOnMap = await this.customerRepository.find({
      select: ['customerID', 'name', 'location'],
    });
    return customersOnMap;
  }

  handlePhoneNumbers(customer: any) {
    const phoneNumbers = customer.phoneNumbers;
    customer.phoneNumber = phoneNumbers[0];
    customer.alternativePhoneNumbers = phoneNumbers.slice(1);
    return customer;
  }
}

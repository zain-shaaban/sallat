import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDtoRequest } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Trip } from 'src/trip/entities/trip.entity';

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel(Customer) private customerModel: typeof Customer,
    @InjectModel(Trip) private tripModel: typeof Trip,
  ) {}

  async create(createCustomerDto: CreateCustomerDtoRequest) {
    let { name, phoneNumber, location } = createCustomerDto;
    const { customerID } = await this.customerModel.create({
      name,
      phoneNumber,
      location: JSON.stringify(location),
    });
    return { customerID };
  }

  async findAll() {
    let allCustomers: any = await this.customerModel.findAll();
    for (let i in allCustomers) {
      const trips: any = (
        await this.tripModel.findAll({
          where: { customerID: allCustomers[i].customerID },
        })
      ).map((trip) => trip.toJSON());
      allCustomers[i] = allCustomers[i].toJSON();
      allCustomers[i].trips = trips;
    }
    return allCustomers;
  }

  async findOne(customerID: number) {
    let customer: any = await this.customerModel.findByPk(customerID);
    if (!customer) throw new NotFoundException();
    customer = customer.toJSON();
    const trips: any = (
      await this.tripModel.findAll({
        where: { customerID: customer.customerID },
      })
    ).map((trip) => trip.toJSON());
    customer.trips = trips;
    return customer;
  }

  async update(customerID: number, updateCustomerDto: UpdateCustomerDto) {
    let { name, phoneNumber, location } = updateCustomerDto;
    const updatedCustomer = await this.customerModel.update(
      { name, phoneNumber, location: JSON.stringify(location) },
      { where: { customerID } },
    );
    if (updatedCustomer[0] === 0) throw new NotFoundException();
    return null;
  }

  async remove(customerID: number) {
    const deletedCustomer = await this.customerModel.destroy({
      where: { customerID },
    });
    if (deletedCustomer == 0) throw new NotFoundException();
    return null;
  }

  async findOnMap() {
    const allCustomersOnMap = await this.customerModel.findAll({
      attributes: ['customerID', 'name', 'location'],
    });
    return allCustomersOnMap;
  }
}

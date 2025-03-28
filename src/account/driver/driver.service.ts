import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDriverDtoRequest } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { Driver } from './entities/driver.entity';
import * as bcrypt from 'bcryptjs';
import { AdminSocketGateway } from 'src/sockets/admin-socket/admin-socket.gateway';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class DriverService {
  constructor(
    @InjectRepository(Driver) private driverRepository: Repository<Driver>,
    @Inject() private readonly adminGateway: AdminSocketGateway,
  ) {}

  async create(createDriverDto: CreateDriverDtoRequest) {
    let { name, email, password, phoneNumber, salary, assignedVehicleNumber } =
      createDriverDto;
    password = bcrypt.hashSync(password, bcrypt.genSaltSync());
    let driver = await this.driverRepository.save({
      name,
      email,
      password,
      phoneNumber,
      salary,
      assignedVehicleNumber,
    });
    delete driver.password;
    this.adminGateway.newDriver(driver);
    return { driverID: driver.driverID };
  }

  async findAll() {
    const allDrivers = await this.driverRepository.find();
    return plainToInstance(Driver, allDrivers);
  }

  async findOne(driverID: string) {
    const driver = await this.driverRepository.findOneBy({ driverID });
    if (!driver) throw new NotFoundException();
    return plainToInstance(Driver, driver);
  }

  async update(driverID: string, updateDriverDto: UpdateDriverDto) {
    let {
      name,
      email,
      password,
      phoneNumber,
      salary,
      assignedVehicleNumber,
      notificationToken,
    } = updateDriverDto;
    if (password) password = bcrypt.hashSync(password, bcrypt.genSaltSync());
    const driver = await this.driverRepository
      .update(driverID, {
        name,
        email,
        password,
        phoneNumber,
        salary,
        assignedVehicleNumber,
        notificationToken,
      })
      .then(({ affected }) => {
        if (affected == 0) throw new NotFoundException();
        return this.driverRepository.findOneBy({ driverID });
      });
    this.adminGateway.updateDriver(driver);
    return null;
  }

  async remove(driverID: string) {
    const { affected } = await this.driverRepository.delete(driverID);
    if (affected == 0) throw new NotFoundException();
    this.adminGateway.deleteDriver(driverID);
    return null;
  }
}

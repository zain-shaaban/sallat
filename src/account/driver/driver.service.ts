import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDriverDtoRequest } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Driver } from './entities/driver.entity';
import * as bcrypt from 'bcryptjs';
import { AdminSocketGateway } from 'src/sockets/admin-socket/admin-socket.gateway';

@Injectable()
export class DriverService {
  constructor(
    @InjectModel(Driver) private driverModel: typeof Driver,
    @Inject() private readonly adminGateway: AdminSocketGateway,
  ) {}

  async create(createDriverDto: CreateDriverDtoRequest) {
    let { name, email, password, phoneNumber, salary, assignedVehicleNumber } =
      createDriverDto;
    password = bcrypt.hashSync(password, bcrypt.genSaltSync());
    let driver = await this.driverModel.create({
      name,
      email,
      password,
      phoneNumber,
      salary,
      assignedVehicleNumber,
    });
    driver = driver.toJSON();
    delete driver.password;
    this.adminGateway.newDriver(driver);
    return { driverID: driver.driverID };
  }

  async findAll() {
    const allDrivers = await this.driverModel.findAll({
      attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
    });
    return allDrivers;
  }

  async findOne(driverID: number) {
    const driver = await this.driverModel.findByPk(driverID, {
      attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
    });
    if (!driver) throw new NotFoundException();
    return driver;
  }

  async update(driverID: number, updateDriverDto: UpdateDriverDto) {
    let { name, email, password, phoneNumber, salary, assignedVehicleNumber } =
      updateDriverDto;
    if (password) password = bcrypt.hashSync(password, bcrypt.genSaltSync());
    const driver = await this.driverModel
      .update(
        { name, email, password, phoneNumber, salary, assignedVehicleNumber },
        { where: { driverID } },
      )
      .then((data) => {
        if (data[0] == 0) throw new NotFoundException();
        return this.driverModel.findByPk(driverID, {
          attributes: { exclude: ['password'] },
        });
      });
    this.adminGateway.updateDriver(driver);
    return null;
  }

  async remove(driverID: number) {
    const deletedDriver = await this.driverModel.destroy({
      where: { driverID },
    });
    if (deletedDriver == 0) throw new NotFoundException();
    this.adminGateway.deleteDriver(driverID);
    return null;
  }
}

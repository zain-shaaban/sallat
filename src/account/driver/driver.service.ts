import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDriverDtoRequest } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Driver } from './entities/driver.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class DriverService {
  constructor(@InjectModel(Driver) private driverModel: typeof Driver) {}

  async create(createDriverDto: CreateDriverDtoRequest) {
    let { name, email, password, phoneNumber, salary, assignedVehicleNumber } =
      createDriverDto;
    password = bcrypt.hashSync(password, bcrypt.genSaltSync());
    const { driverID } = await this.driverModel.create({
      name,
      email,
      password,
      phoneNumber,
      salary,
      assignedVehicleNumber,
    });
    return { driverID };
  }

  async findAll() {
    const allDrivers = await this.driverModel.findAll({
      attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
    });
    return { NumberOfDivers: allDrivers.length, allDrivers };
  }

  async findOne(driverID: number) {
    const driver = await this.driverModel.findByPk(driverID, {
      attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
    });
    if (!driver) throw new NotFoundException();
    return { driver };
  }

  async update(driverID: number, updateDriverDto: UpdateDriverDto) {
    let { name, email, password, phoneNumber, salary, assignedVehicleNumber } =
      updateDriverDto;
    if (password) password = bcrypt.hashSync(password, bcrypt.genSaltSync());
    const updatedDriver = await this.driverModel.update(
      { name, email, password, phoneNumber, salary, assignedVehicleNumber },
      { where: { driverID } },
    );
    if (updatedDriver[0] === 0) throw new NotFoundException();
    return null;
  }

  async remove(driverID: number) {
    const deletedDriver = await this.driverModel.destroy({
      where: { driverID },
    });
    if (deletedDriver == 0) throw new NotFoundException();
    return null;
  }
}

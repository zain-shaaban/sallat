import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateManagerDtoRequest } from './dto/create-manager.dto';
import { UpdateManagerDto } from './dto/update-manager.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Manager } from './entities/manager.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ManagerService {
  constructor(@InjectModel(Manager) private managerModel: typeof Manager) {}

  async create(createManagerDto: CreateManagerDtoRequest) {
    let { name, email, password, phoneNumber, salary} =
      createManagerDto;
    password = bcrypt.hashSync(password, bcrypt.genSaltSync());
    const { managerID } = await this.managerModel.create({
      name,
      email,
      password,
      phoneNumber,
      salary,
      superAdmin:false
    });
    return { managerID };
  }

  async findAll() {
    const allManagers = await this.managerModel.findAll({
      attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
    });
    return { NumberOfDivers: allManagers.length, allManagers };
  }

  async findOne(managerID: number) {
    const manager = await this.managerModel.findByPk(managerID, {
      attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
    });
    if (!manager) throw new NotFoundException();
    return { manager };
  }

  async update(managerID: number, updateManagerDto: UpdateManagerDto) {
    let { name, email, password, phoneNumber, salary } =
      updateManagerDto;
    if (password) password = bcrypt.hashSync(password, bcrypt.genSaltSync());
    const updatedManager = await this.managerModel.update(
      { name, email, password, phoneNumber, salary },
      { where: { managerID } },
    );
    if (updatedManager[0] === 0) throw new NotFoundException();
    return null;
  }

  async remove(managerID: number) {
    const deletedManager = await this.managerModel.destroy({
      where: { managerID },
    });
    if (deletedManager == 0) throw new NotFoundException();
    return null;
  }
}

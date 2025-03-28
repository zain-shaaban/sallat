import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateManagerDtoRequest } from './dto/create-manager.dto';
import { UpdateManagerDto } from './dto/update-manager.dto';
import { Manager } from './entities/manager.entity';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ManagerService {
  constructor(
    @InjectRepository(Manager) private managerRepository: Repository<Manager>,
  ) {}

  async create(createManagerDto: CreateManagerDtoRequest) {
    let { name, email, password, phoneNumber, salary } = createManagerDto;
    password = bcrypt.hashSync(password, bcrypt.genSaltSync());
    const { managerID } = await this.managerRepository.save({
      name,
      email,
      password,
      phoneNumber,
      salary,
      superAdmin: false,
    });
    return { managerID };
  }

  async findAll() {
    const allManagers = await this.managerRepository.find();
    return plainToInstance(Manager, allManagers);
  }

  async findOne(managerID: string) {
    const manager = await this.managerRepository.findOneBy({ managerID });
    if (!manager) throw new NotFoundException();
    return plainToInstance(Manager, manager);
  }

  async update(managerID: string, updateManagerDto: UpdateManagerDto) {
    let { name, email, password, phoneNumber, salary } = updateManagerDto;
    if (password) password = bcrypt.hashSync(password, bcrypt.genSaltSync());
    const { affected } = await this.managerRepository.update(managerID, {
      name,
      email,
      password,
      phoneNumber,
      salary,
    });
    if (affected === 0) throw new NotFoundException();
    return null;
  }

  async remove(managerID: string) {
    const { affected } = await this.managerRepository.delete(managerID);
    if (affected == 0) throw new NotFoundException();
    return null;
  }
}

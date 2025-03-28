import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCcDtoRequest } from './dto/create-cc.dto';
import { UpdateCcDto } from './dto/update-cc.dto';
import { Cc } from './entities/cc.entity';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CcService {
  constructor(@InjectRepository(Cc) private ccRepository: Repository<Cc>) {}

  async create(createCcDto: CreateCcDtoRequest) {
    let { name, email, password, phoneNumber, salary } = createCcDto;
    password = bcrypt.hashSync(password, bcrypt.genSaltSync());
    const { ccID } = await this.ccRepository.save({
      name,
      email,
      password,
      phoneNumber,
      salary,
    });
    return { ccID };
  }

  async findAll() {
    const allCc = await this.ccRepository.find();
    return plainToInstance(Cc, allCc);
  }

  async findOne(ccID: string) {
    const cc = await this.ccRepository.findOneBy({ ccID });
    if (!cc) throw new NotFoundException();
    return plainToInstance(Cc, cc);
  }

  async update(ccID: string, updateCcDto: UpdateCcDto) {
    let { name, email, password, phoneNumber, salary } = updateCcDto;
    if (password) password = bcrypt.hashSync(password, bcrypt.genSaltSync());
    const { affected } = await this.ccRepository.update(ccID, {
      name,
      email,
      password,
      phoneNumber,
      salary,
    });
    if (affected == 0) throw new NotFoundException();
    return null;
  }

  async remove(ccID: string) {
    const { affected } = await this.ccRepository.delete(ccID);
    if (affected == 0) throw new NotFoundException();
    return null;
  }
}

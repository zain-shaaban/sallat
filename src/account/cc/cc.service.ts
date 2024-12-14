import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCcDtoRequest } from './dto/create-cc.dto';
import { UpdateCcDto } from './dto/update-cc.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Cc } from './entities/cc.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class CcService {
  constructor(@InjectModel(Cc) private ccModel: typeof Cc) {}

  async create(createCcDto: CreateCcDtoRequest) {
    let { name, email, password, phoneNumber, salary } = createCcDto;
    password = bcrypt.hashSync(password, bcrypt.genSaltSync());
    const { ccID } = await this.ccModel.create({
      name,
      email,
      password,
      phoneNumber,
      salary,
    });
    return { ccID };
  }

  async findAll() {
    const allCc = await this.ccModel.findAll({
      attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
    });
    return { NumberOfDivers: allCc.length, allCc };
  }

  async findOne(ccID: number) {
    const cc = await this.ccModel.findByPk(ccID, {
      attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
    });
    if (!cc) throw new NotFoundException();
    return { cc };
  }

  async update(ccID: number, updateCcDto: UpdateCcDto) {
    let { name, email, password, phoneNumber, salary } = updateCcDto;
    if (password) password = bcrypt.hashSync(password, bcrypt.genSaltSync());
    const updatedCc = await this.ccModel.update(
      { name, email, password, phoneNumber, salary },
      { where: { ccID } },
    );
    if (updatedCc[0] === 0) throw new NotFoundException();
    return null;
  }

  async remove(ccID: number) {
    const deletedCc = await this.ccModel.destroy({
      where: { ccID },
    });
    if (deletedCc == 0) throw new NotFoundException();
    return null;
  }
}

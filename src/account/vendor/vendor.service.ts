import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVendorDtoRequest } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Vendor } from './entities/vendor.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class VendorService {
  constructor(@InjectModel(Vendor) private vendorModel: typeof Vendor) {}

  async create(createVendorDto: CreateVendorDtoRequest) {
    let { name, email, password, phoneNumber, salary } = createVendorDto;
    password = bcrypt.hashSync(password, bcrypt.genSaltSync());
    const { vendorID } = await this.vendorModel.create({
      name,
      email,
      password,
      phoneNumber,
      salary,
    });
    return { vendorID };
  }

  async findAll() {
    const allVendors = await this.vendorModel.findAll({
      attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
    });
    return { NumberOfDivers: allVendors.length, allVendors };
  }

  async findOne(vendorID: number) {
    const vendor = await this.vendorModel.findByPk(vendorID, {
      attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
    });
    if (!vendor) throw new NotFoundException();
    return { vendor };
  }

  async update(vendorID: number, updateVendorDto: UpdateVendorDto) {
    let { name, email, password, phoneNumber, salary } = updateVendorDto;
    if (password) password = bcrypt.hashSync(password, bcrypt.genSaltSync());
    const updatedVendor = await this.vendorModel.update(
      { name, email, password, phoneNumber, salary },
      { where: { vendorID } },
    );
    if (updatedVendor[0] === 0) throw new NotFoundException();
    return null;
  }

  async remove(vendorID: number) {
    const deletedVendor = await this.vendorModel.destroy({
      where: { vendorID },
    });
    if (deletedVendor == 0) throw new NotFoundException();
    return null;
  }
}

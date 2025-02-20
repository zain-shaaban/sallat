import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateVendorDtoRequest } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcryptjs';
import { Vendor } from 'src/vendor/entities/vendor.entity';
import { AdminSocketGateway } from 'src/sockets/admin-socket/admin-socket.gateway';

@Injectable()
export class VendorService {
  constructor(
    @InjectModel(Vendor) private vendorModel: typeof Vendor,
    @Inject() private readonly adminGateway: AdminSocketGateway,
  ) {}

  async create(createVendorDto: CreateVendorDtoRequest) {
    let { name, email, password, phoneNumber, salary } = createVendorDto;
    password = bcrypt.hashSync(password, bcrypt.genSaltSync());
    const vendor = await this.vendorModel.create({
      name,
      email,
      password,
      phoneNumber,
      salary,
    });
    this.adminGateway.newVendor(vendor);
    return { vendor: vendor.vendorID };
  }

  async findAll() {
    const allVendors = await this.vendorModel.findAll({
      attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
    });
    return allVendors;
  }

  async findOne(vendorID: number) {
    const vendor = await this.vendorModel.findByPk(vendorID, {
      attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
    });
    if (!vendor) throw new NotFoundException();
    return vendor;
  }

  async update(vendorID: number, updateVendorDto: UpdateVendorDto) {
    let { name, email, password, phoneNumber, salary } = updateVendorDto;
    if (password) password = bcrypt.hashSync(password, bcrypt.genSaltSync());
    const vendor = await this.vendorModel
      .update(
        { name, email, password, phoneNumber, salary },
        { where: { vendorID } },
      )
      .then((data) => {
        if (data[0] == 0) throw new NotFoundException();
        return this.vendorModel.findByPk(vendorID);
      });
    this.adminGateway.updateVendor(vendor);
    return null;
  }

  async remove(vendorID: number) {
    const deletedVendor = await this.vendorModel.destroy({
      where: { vendorID },
    });
    if (deletedVendor == 0) throw new NotFoundException();
    this.adminGateway.deleteVendor(vendorID);
    return null;
  }
}

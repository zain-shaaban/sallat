import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateVendorDtoRequest } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import * as bcrypt from 'bcryptjs';
import { Vendor } from 'src/vendor/entities/vendor.entity';
import { AdminSocketGateway } from 'src/sockets/admin-socket/admin-socket.gateway';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class VendorService {
  constructor(
    @InjectRepository(Vendor) private vendorRepository: Repository<Vendor>,
    @Inject() private readonly adminGateway: AdminSocketGateway,
  ) {}

  async create(createVendorDto: CreateVendorDtoRequest) {
    let { name, email, password, phoneNumber, partner, location } =
      createVendorDto;
    password = bcrypt.hashSync(password, bcrypt.genSaltSync());
    let vendor = await this.vendorRepository.save({
      name,
      phoneNumber,
      location,
      email,
      partner,
      password,
    });
    delete vendor.password;
    this.adminGateway.newVendor(vendor);
    return { vendorID: vendor.vendorID };
  }

  async findAll() {
    const allVendors = await this.vendorRepository.find();
    return plainToInstance(Vendor, allVendors);
  }

  async findOne(vendorID: string) {
    const vendor = await this.vendorRepository.findOneBy({ vendorID });
    if (!vendor) throw new NotFoundException();
    return plainToInstance(Vendor, vendor);
  }

  async update(vendorID: string, updateVendorDto: UpdateVendorDto) {
    let { name, email, password, phoneNumber, partner, location } =
      updateVendorDto;
    if (password) password = bcrypt.hashSync(password, bcrypt.genSaltSync());
    const vendor = await this.vendorRepository
      .update(vendorID, {
        name,
        phoneNumber,
        location,
        email,
        partner,
        password,
      })
      .then(({ affected }) => {
        if (affected == 0) throw new NotFoundException();
        return this.vendorRepository.findOneBy({ vendorID });
      });
    this.adminGateway.updateVendor(vendor);
    return null;
  }

  async remove(vendorID: string) {
    const { affected } = await this.vendorRepository.delete(vendorID);
    if (affected == 0) throw new NotFoundException();
    this.adminGateway.deleteVendor(vendorID);
    return null;
  }
}

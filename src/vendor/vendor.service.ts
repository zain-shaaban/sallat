import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Vendor } from './entities/vendor.entity';
import { CreateVendorDtoRequest2 } from './dto/create-vendor.dto';
import { UpdateVendorDto2 } from './dto/update-vendor.dto';
import * as bcrypt from 'bcryptjs';
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

  async create(createVendorDto: CreateVendorDtoRequest2) {
    let { name, phoneNumber, location, email, partner, password } =
      createVendorDto;
    if (password) password = bcrypt.hashSync(password, bcrypt.genSaltSync());
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
    let allVendors: any = await this.vendorRepository.find();
    return plainToInstance(Vendor, allVendors);
  }

  async findOne(vendorID: string) {
    let vendor: any = await this.vendorRepository.findOneBy({ vendorID });
    if (!vendor) throw new NotFoundException();
    return plainToInstance(Vendor, vendor);
  }

  async update(vendorID: string, updateVendorDto: UpdateVendorDto2) {
    let { name, phoneNumber, location, email, password, partner } =
      updateVendorDto;
    if (password) password = bcrypt.hashSync(password, bcrypt.genSaltSync());
    const updatedVendor = await this.vendorRepository
      .update(vendorID, {
        name,
        phoneNumber,
        location,
        email,
        password,
        partner,
      })
      .then(({ affected }) => {
        if (affected == 0) throw new NotFoundException();
        return this.vendorRepository.findOneBy({ vendorID });
      });
    this.adminGateway.updateVendor(updatedVendor);
    return null;
  }

  async remove(vendorID: string) {
    const { affected } = await this.vendorRepository.delete(vendorID);
    if (affected == 0) throw new NotFoundException();
    this.adminGateway.deleteVendor(vendorID);
    return null;
  }

  async findOnMap() {
    const allVendorsOnMap = await this.vendorRepository.find({
      select: ['vendorID', 'name', 'location'],
    });
    return allVendorsOnMap;
  }
}

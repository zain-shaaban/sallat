import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Vendor } from './entities/vendor.entity';
import { CreateVendorDtoRequest } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { AdminService } from 'src/sockets/admin/admin.service';
import { VendorSocketService } from 'src/sockets/vendor/vendor.service';

@Injectable()
export class VendorService {
  constructor(
    @InjectRepository(Vendor) private vendorRepository: Repository<Vendor>,
    @Inject() private readonly adminService: AdminService,
    @Inject() private readonly vendorSocketService: VendorSocketService,
  ) {}

  async create({
    name,
    phoneNumber,
    location,
    password,
    partner,
  }: CreateVendorDtoRequest) {
    const vendor = this.vendorRepository.create({
      name,
      phoneNumber,
      location,
      password,
      partner,
    });

    await this.vendorRepository.save(vendor);

    delete vendor.password;

    this.adminService.newVendor(vendor);

    return { vendorID: vendor.vendorID };
  }

  async findAll() {
    const vendors = await this.vendorRepository.find();

    return plainToInstance(Vendor, vendors);
  }

  async findOne(vendorID: string) {
    let vendor: any = await this.vendorRepository.findOneBy({ vendorID });

    if (!vendor)
      throw new NotFoundException(`Vendor with ID ${vendorID} not found`);

    return plainToInstance(Vendor, vendor);
  }

  async update(vendorID: string, updateVendorDto: UpdateVendorDto) {
    let { name, phoneNumber, location, password, partner } = updateVendorDto;
    if (partner === false) password = null;

    const updatedVendor = await this.vendorRepository.preload({
      vendorID,
      name,
      phoneNumber,
      location,
      password,
      partner,
    });

    if (!updatedVendor)
      throw new NotFoundException(`Vendor with ID ${vendorID} not found`);

    await this.vendorRepository.save(updatedVendor);

    this.adminService.updateVendor(updatedVendor);

    return null;
  }

  async remove(vendorID: string) {
    const { affected } = await this.vendorRepository.delete(vendorID);

    if (affected === 0)
      throw new NotFoundException(`Vendor with ID ${vendorID} not found`);

    this.adminService.deleteVendor(vendorID);

    return null;
  }

  async findOnMap() {
    const vendorsOnMap = await this.vendorRepository.find({
      select: ['vendorID', 'name', 'location'],
    });

    return vendorsOnMap;
  }

  async changeAvailability(managerName: string, availability: boolean) {
    this.vendorSocketService.changeAvailability(managerName,availability);
    return null
  }
}

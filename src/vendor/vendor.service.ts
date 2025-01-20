import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Vendor } from './entities/vendor.entity';
import { CreateVendorDtoRequest2 } from './dto/create-vendor.dto';
import { UpdateVendorDto2 } from './dto/update-vendor.dto';
import { Trip } from 'src/trip/entities/trip.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class VendorService {
  constructor(
    @InjectModel(Vendor) private vendorModel: typeof Vendor,
    @InjectModel(Trip) private tripModel: typeof Trip,
  ) {}

  async create(createVendorDto: CreateVendorDtoRequest2) {
    let { name, phoneNumber, location, email, partner, password } =
      createVendorDto;
    if (password) password = bcrypt.hashSync(password, bcrypt.genSaltSync());
    const { vendorID } = await this.vendorModel.create({
      name,
      phoneNumber,
      location: JSON.stringify(location),
      email,
      partner,
      password,
    });
    return { vendorID };
  }

  async findAll() {
    let allVendors: any = await this.vendorModel.findAll();
    for (let i in allVendors) {
      const trips: any = (
        await this.tripModel.findAll({
          where: { vendorID: allVendors[i].vendorID },
          attributes: { exclude: ['password'] },
        })
      ).map((trip) => trip.toJSON());
      allVendors[i] = allVendors[i].toJSON();
      allVendors[i].trips = trips;
    }
    return allVendors;
  }

  async findOne(vendorID: number) {
    let vendor: any = await this.vendorModel.findByPk(vendorID, {
      attributes: { exclude: ['password'] },
    });
    if (!vendor) throw new NotFoundException();
    vendor = vendor.toJSON();
    const trips: any = (
      await this.tripModel.findAll({
        where: { vendorID: vendor.vendorID },
      })
    ).map((trip) => trip.toJSON());
    vendor.trips = trips;
    return vendor;
  }

  async update(vendorID: number, updateVendorDto: UpdateVendorDto2) {
    let { name, phoneNumber, location, email, password, partner } =
      updateVendorDto;
    if (password) password = bcrypt.hashSync(password, bcrypt.genSaltSync());
    const updatedVendor = await this.vendorModel.update(
      {
        name,
        phoneNumber,
        location: JSON.stringify(location),
        email,
        password,
        partner,
      },
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

  async findOnMap() {
    const allVendorsOnMap = await this.vendorModel.findAll({
      attributes: ['vendorID', 'name', 'location'],
    });
    return allVendorsOnMap;
  }
}

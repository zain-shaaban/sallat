import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Cc } from 'src/account/cc/entities/cc.entity';
import { Driver } from 'src/account/driver/entities/driver.entity';
import { Manager } from 'src/account/manager/entities/manager.entity';
import { Vendor } from 'src/vendor/entities/vendor.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AccountAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Driver) private driverRepository: Repository<Driver>,
    @InjectRepository(Cc) private ccRepository: Repository<Cc>,
    @InjectRepository(Manager) private managerRepository: Repository<Manager>,
    @InjectRepository(Vendor) private vendorRepository: Repository<Vendor>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const token = request.header('Authorization')?.split(' ')[1];
      if (!token) throw new UnauthorizedException('Invalid token');
      const { id, role } = this.jwtService.verify(token);
      if (!this.checkAccount(id, role))
        throw new UnauthorizedException('Invalid token');
      request.user = { id, role };
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async checkAccount(id: string, role: string) {
    switch (role) {
      case 'manager':
        return (await this.managerRepository.findOneBy({ managerID: id }))
          ? true
          : false;
      case 'vendor':
        return (await this.vendorRepository.findOneBy({ vendorID: id }))
          ? true
          : false;
      case 'cc':
        return (await this.ccRepository.findOneBy({ ccID: id })) ? true : false;
      case 'driver':
        return (await this.driverRepository.findOneBy({ driverID: id }))
          ? true
          : false;
    }
  }
}

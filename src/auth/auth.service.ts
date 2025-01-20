import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginRequestDto } from './dto/login.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Cc } from 'src/account/cc/entities/cc.entity';
import { Driver } from 'src/account/driver/entities/driver.entity';
import { Manager } from 'src/account/manager/entities/manager.entity';
import { Vendor } from 'src/vendor/entities/vendor.entity';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

export enum Role {
  Driver = 'driver',
  Manager = 'manager',
  Vendor = 'vendor',
  CC = 'cc',
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Cc) private ccModel: typeof Cc,
    @InjectModel(Driver) private driverModel: typeof Driver,
    @InjectModel(Manager) private managerModel: typeof Manager,
    @InjectModel(Vendor) private vendorModel: typeof Vendor,
    private readonly jwtService: JwtService,
  ) {}
  async login(loginDto: LoginRequestDto, type: string) {
    switch (type) {
      case Role.Manager:
        return await this.managerLogin(loginDto);
      case Role.Driver:
        return await this.driverLogin(loginDto);
      case Role.Vendor:
        return await this.vendorLogin(loginDto);
      case Role.CC:
        return await this.ccLogin(loginDto);
      default:
        throw new NotFoundException();
    }
  }
  async managerLogin(loginDto: LoginRequestDto) {
    const { email, password } = loginDto;
    const manager = await this.managerModel.findOne({ where: { email } });
    if (!manager) throw new UnauthorizedException('Wrong credentials');
    const auth = bcrypt.compareSync(password, manager.password);
    if (!auth) throw new UnauthorizedException('Wrong credentials');
    const accessToken = this.jwtService.sign({
      id: manager.managerID,
      role: Role.Manager,
    });
    return { accessToken };
  }
  async driverLogin(loginDto: LoginRequestDto) {
    const { email, password } = loginDto;
    const driver = await this.driverModel.findOne({ where: { email } });
    if (!driver) throw new UnauthorizedException('Wrong credentials');
    const auth = bcrypt.compareSync(password, driver.password);
    if (!auth) throw new UnauthorizedException('Wrong credentials');
    const accessToken = this.jwtService.sign({
      id: driver.driverID,
      role: Role.Driver,
    });
    return { accessToken };
  }
  async vendorLogin(loginDto: LoginRequestDto) {
    const { email, password } = loginDto;
    const vendor = await this.vendorModel.findOne({ where: { email } });
    if (!vendor) throw new UnauthorizedException('Wrong credentials');
    const auth = bcrypt.compareSync(password, vendor.password);
    if (!auth) throw new UnauthorizedException('Wrong credentials');
    const accessToken = this.jwtService.sign({
      id: vendor.vendorID,
      role: Role.Vendor,
    });
    return { accessToken };
  }
  async ccLogin(loginDto: LoginRequestDto) {
    const { email, password } = loginDto;
    const cc = await this.ccModel.findOne({ where: { email } });
    if (!cc) throw new UnauthorizedException('Wrong credentials');
    const auth = bcrypt.compareSync(password, cc.password);
    if (!auth) throw new UnauthorizedException('Wrong credentials');
    const accessToken = this.jwtService.sign({ id: cc.ccID, role: Role.CC });
    return { accessToken };
  }
}

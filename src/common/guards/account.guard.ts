import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { Cc } from 'src/account/cc/entities/cc.entity';
import { Driver } from 'src/account/driver/entities/driver.entity';
import { Manager } from 'src/account/manager/entities/manager.entity';
import { Vendor } from 'src/account/vendor/entities/vendor.entity';

@Injectable()
export class AccountAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(Driver) private driverModel: typeof Driver,
    @InjectModel(Cc) private ccModel: typeof Cc,
    @InjectModel(Manager) private managerModel: typeof Manager,
    @InjectModel(Vendor) private vendorModel: typeof Vendor,
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

  async checkAccount(id: number, role: string) {
    switch (role) {
      case 'manager':
        return (await this.managerModel.findByPk(id)) ? true : false;
      case 'vendor':
        return (await this.vendorModel.findByPk(id)) ? true : false;
      case 'cc':
        return (await this.ccModel.findByPk(id)) ? true : false;
      case 'driver':
        return (await this.driverModel.findByPk(id)) ? true : false;
    }
  }
}

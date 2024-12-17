import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { Vendor } from 'src/account/vendor/entities/vendor.entity';

@Injectable()
export class VendorAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(Vendor) private vendorModel: typeof Vendor,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request: Request = context.switchToHttp().getRequest();
      const token = request.header('Authorization')?.split(' ')[1];
      if (!token) throw new UnauthorizedException('Invalid token');
      const { vendorID } = this.jwtService.verify(token);
      const vendor = await this.vendorModel.findByPk(vendorID);
      if (!vendor) throw new UnauthorizedException('Invalid token');
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

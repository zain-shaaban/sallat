import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { Request } from 'express';
import { Driver } from 'src/account/driver/entities/driver.entity';

@Injectable()
export class DriverAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService,@InjectModel(Driver) private driverModel:typeof Driver) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean>{
    try {
      const request: Request = context.switchToHttp().getRequest();
      const token = request.header('Authorization')?.split(' ')[1];
      if (!token) throw new UnauthorizedException('Invalid token');
      const {driverID} = this.jwtService.verify(token);
      const driver=await this.driverModel.findByPk(driverID)
      if(!driver)
        throw new UnauthorizedException('Invalid token')
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

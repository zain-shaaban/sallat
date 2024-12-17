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
import { Manager } from 'src/account/manager/entities/manager.entity';

@Injectable()
export class ManagerAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(Manager) private managerModel: typeof Manager,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request: Request = context.switchToHttp().getRequest();
      const token = request.header('Authorization')?.split(' ')[1];
      if (!token) throw new UnauthorizedException('Invalid token');
      const { managerID } = this.jwtService.verify(token);
      const manager = await this.managerModel.findByPk(managerID);
      if (!manager) throw new UnauthorizedException('Invalid token');
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

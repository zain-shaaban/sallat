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
import { Cc } from 'src/account/cc/entities/cc.entity';

@Injectable()
export class CcAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(Cc) private ccModel: typeof Cc,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request: Request = context.switchToHttp().getRequest();
      const token = request.header('Authorization')?.split(' ')[1];
      if (!token) throw new UnauthorizedException('Invalid token');
      const { ccID } = this.jwtService.verify(token);
      const cc = await this.ccModel.findByPk(ccID);
      if (!cc) throw new UnauthorizedException('Invalid token');
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

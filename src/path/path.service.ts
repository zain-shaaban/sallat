import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Path } from './entities/path.entity';

@Injectable()
export class PathService {
  constructor(@InjectModel(Path) private pathModel:typeof Path){}

  async create(path:any) {
    return await this.pathModel.create({path,date:new Date().getTime()});
  }

  async findAll() {
    return await this.pathModel.findAll({attributes:['pathID','date']});
  }

  async findOne(pathID: number) {
    const path=await this.pathModel.findOne({where:{pathID}});
    if(!path) throw new NotFoundException()
    return path
  }
}

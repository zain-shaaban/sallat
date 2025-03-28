import { Injectable, NotFoundException } from '@nestjs/common';
import { Path } from './entities/path.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PathService {
  constructor(
    @InjectRepository(Path) private pathRepository: Repository<Path>,
  ) {}

  async create(path: any) {
    return await this.pathRepository.save({ path, date: new Date().getTime() });
  }

  async findAll() {
    return await this.pathRepository.find({ select: ['pathID', 'date'] });
  }

  async findOne(pathID: string) {
    const path = await this.pathRepository.findOne({ where: { pathID } });
    if (!path) throw new NotFoundException();
    return path;
  }
}

import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { PathService } from './path.service';
import { asyncHandler } from 'src/common/utils/async-handler';

@Controller('testing/path')
export class PathController {
  constructor(private readonly pathService: PathService) {}

  @Get()
  findAll() {
    return this.pathService.findAll();
  }

  @Get(':pathID')
  async findOne(@Param('pathID') pathID: string) {
    return await asyncHandler(this.pathService.findOne(pathID));
  }
}

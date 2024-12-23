import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Category } from './entities/category.entity';
import { Item } from './entities/item.entity';

@Module({
  imports:[SequelizeModule.forFeature([Category,Item])],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}

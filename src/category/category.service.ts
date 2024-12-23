import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Category } from './entities/category.entity';
import { Item } from './entities/item.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { DeleteCategoryDto } from './dto/delete-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category) private categoryModel: typeof Category,
    @InjectModel(Item) private itemModel: typeof Item,
  ) {}

  async getAll() {
    let allCategories: any = await this.categoryModel.findAll();
    allCategories = await Promise.all(
      allCategories.map(async (category) => {
        category = category.toJSON();
        const types = await this.itemModel.findAll({
          attributes: ['type'],
          where: { category: category.type },
        });
        return {
          ...category,
          types,
        };
      }),
    );
    return allCategories;
  }

  async add(data: CreateCategoryDto) {
    const { type, category } = data;
    if (!category) return await this.createCategory(type);
    return await this.createItem(type, category);
  }

  async update(data: UpdateCategoryDto) {
    const { isCategory, oldType, newType } = data;
    if (isCategory) return await this.updateCategory(oldType, newType);
    return await this.updatedItem(oldType, newType);
  }

  async delete(data: DeleteCategoryDto) {
    const { isCategory, type } = data;
    if (isCategory) return await this.deleteCategory(type);
    return await this.deleteItem(type);
  }

  async createCategory(type: string) {
    await this.categoryModel.create({ type });
    return null;
  }

  async createItem(type: string, category: string) {
    const existingCategory = await this.categoryModel.findOne({
      where: { type: category },
    });
    if (!existingCategory) await this.categoryModel.create({ type: category });
    await this.itemModel.create({ type, category });
    return null;
  }

  async updateCategory(oldType: string, newType: string) {
    const [updatedSuccessfully] = await this.categoryModel.update(
      { type: newType },
      { where: { type: oldType } },
    );
    if (!updatedSuccessfully) throw new NotFoundException();

    await this.itemModel.update(
      { category: newType },
      { where: { category: oldType } },
    );
    return null;
  }

  async updatedItem(oldType: string, newType: string) {
    const [updatedSuccessfully] = await this.itemModel.update(
      { type: newType },
      { where: { type: oldType } },
    );
    if (!updatedSuccessfully) throw new NotFoundException();
    return null;
  }

  async deleteCategory(type: string) {
    const deletedSuccessfully = await this.categoryModel.destroy({
      where: { type },
    });
    if (!deletedSuccessfully) throw new NotFoundException();
    return null;
  }

  async deleteItem(type: string) {
    const deletedSuccessfully = await this.itemModel.destroy({
      where: { type },
    });
    if (!deletedSuccessfully) throw new NotFoundException();
    return null;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { Category } from './entities/category.entity';
import { Item } from './entities/item.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { DeleteCategoryDto } from './dto/delete-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Item) private itemRepository: Repository<Item>,
  ) {}

  async getAll() {
    let allCategories: any = await this.categoryRepository.find();
    allCategories = await Promise.all(
      allCategories.map(async (category) => {
        const types = await this.itemRepository.find({
          select: ['type'],
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
    await this.categoryRepository.insert({ type });
    return null;
  }

  async createItem(type: string, category: string) {
    const existingCategory = await this.categoryRepository.findOneBy({
      type: category,
    });
    if (!existingCategory)
      await this.categoryRepository.insert({ type: category });
    await this.itemRepository.insert({ type, category });
    return null;
  }

  async updateCategory(oldType: string, newType: string) {
    const { affected } = await this.categoryRepository.update(oldType, {
      type: newType,
    });
    if (!affected) throw new NotFoundException();

    await this.itemRepository.update(
      { category: oldType },
      { category: newType },
    );
    return null;
  }

  async updatedItem(oldType: string, newType: string) {
    const { affected } = await this.itemRepository.update(
      { type: oldType },
      { type: newType },
    );
    if (!affected) throw new NotFoundException();
    return null;
  }

  async deleteCategory(type: string) {
    const { affected } = await this.categoryRepository.delete({ type });
    if (!affected) throw new NotFoundException();
    return null;
  }

  async deleteItem(type: string) {
    const { affected } = await this.itemRepository.delete({ type });
    if (!affected) throw new NotFoundException();
    return null;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { DeleteCategoryDto } from './dto/delete-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ArrayContains, Repository } from 'typeorm';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async getAll() {
    let allCategories = await this.categoryRepository.find();
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
    if (!existingCategory) {
      this.categoryRepository.insert({ type: category, types: [type] });
    } else {
      existingCategory.types.push(type);
      this.categoryRepository.save(existingCategory);
    }
    return null;
  }

  async updateCategory(oldType: string, newType: string) {
    const { affected } = await this.categoryRepository.update(oldType, {
      type: newType,
    });
    if (!affected) throw new NotFoundException();
    return null;
  }

  async updatedItem(oldType: string, newType: string) {
    const category = await this.categoryRepository.findOne({
      where: { types: ArrayContains([oldType]) },
    });
    if (!category) throw new NotFoundException();
    category.types = category.types.filter((item) => item !== oldType);
    category.types.push(newType);
    this.categoryRepository.save(category);
    return null;
  }

  async deleteCategory(type: string) {
    const { affected } = await this.categoryRepository.delete({ type });
    if (!affected) throw new NotFoundException();
    return null;
  }

  async deleteItem(type: string) {
    const category = await this.categoryRepository.findOne({
      where: { types: ArrayContains([type]) },
    });
    if (!category) throw new NotFoundException();
    category.types = category.types.filter((item) => item !== type);
    this.categoryRepository.save(category);
    return null;
  }
}

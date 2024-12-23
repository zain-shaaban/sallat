import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { asyncHandler } from 'src/common/utils/async-handler';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { DeleteCategoryDto } from './dto/delete-category.dto';
import { GetAllCategoriesDto } from './dto/get-all-categories.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetAllCategoriesDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing token',
    schema: {
      example: {
        status: false,
        message: 'Invalid token',
      },
    },
  })
  @Get('')
  async getAllCategories() {
    return await asyncHandler(this.categoryService.getAll());
  }
  @ApiOperation({ summary: 'Create new category' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The category has been successfully added',
    schema: {
      example: {
        status: true,
        data: null,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing token',
    schema: {
      example: {
        status: false,
        message: 'Invalid token',
      },
    },
  })
  @Post('add')
  async add(@Body() createCategoryDto: CreateCategoryDto) {
    return await asyncHandler(this.categoryService.add(createCategoryDto));
  }

  @ApiOperation({ summary: 'Update category' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The category has been successfully updated',
    schema: {
      example: {
        status: true,
        data: null,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing token',
    schema: {
      example: {
        status: false,
        message: 'Invalid token',
      },
    },
  })
  @Patch('update')
  async update(@Body() updateCategoryDto: UpdateCategoryDto) {
    return await asyncHandler(this.categoryService.update(updateCategoryDto));
  }

  @ApiOperation({ summary: 'Delete category' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The category has been successfully deleted',
    schema: {
      example: {
        status: true,
        data: null,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing token',
    schema: {
      example: {
        status: false,
        message: 'Invalid token',
      },
    },
  })
  @Delete('delete')
  async delete(@Body() deleteCategoryDto: DeleteCategoryDto) {
    return await asyncHandler(this.categoryService.delete(deleteCategoryDto));
  }
}

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
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { asyncHandler } from 'src/common/utils/async-handler';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { DeleteCategoryDto } from './dto/delete-category.dto';
import { GetAllCategoriesDto } from './dto/get-all-categories.dto';

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiOperation({ 
    summary: 'Get all categories',
    description: 'Retrieves a list of all categories and their associated types. Returns a hierarchical structure of categories and their items.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved all categories',
    type: GetAllCategoriesDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication failed - invalid or missing token',
    schema: {
      example: {
        status: false,
        message: 'invalid token',
      },
    },
  })
  @Get('')
  async getAllCategories() {
    return await asyncHandler(this.categoryService.getAll());
  }

  @ApiOperation({ 
    summary: 'Create new category',
    description: 'Creates a new category or type. If category field is provided, it creates a type under that category. If no category is provided, it creates a new category.'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The category/type has been successfully created',
    schema: {
      example: {
        status: true,
        data: null,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication failed - invalid or missing token',
    schema: {
      example: {
        status: false,
        message: 'invalid token',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
    schema: {
      example: {
        status: false,
        message: 'Invalid input data',
      },
    },
  })
  @Post('add')
  async add(@Body() createCategoryDto: CreateCategoryDto) {
    return await asyncHandler(this.categoryService.add(createCategoryDto));
  }

  @ApiOperation({ 
    summary: 'Update category',
    description: 'Updates an existing category or type. Use isCategory flag to specify whether updating a category or a type.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The category/type has been successfully updated',
    schema: {
      example: {
        status: true,
        data: null,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication failed - invalid or missing token',
    schema: {
      example: {
        status: false,
        message: 'invalid token',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category/type not found',
    schema: {
      example: {
        status: false,
        message: 'Category not found',
      },
    },
  })
  @Patch('update')
  async update(@Body() updateCategoryDto: UpdateCategoryDto) {
    return await asyncHandler(this.categoryService.update(updateCategoryDto));
  }

  @ApiOperation({ 
    summary: 'Delete category',
    description: 'Deletes an existing category or type. Use isCategory flag to specify whether deleting a category or a type.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The category/type has been successfully deleted',
    schema: {
      example: {
        status: true,
        data: null,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication failed - invalid or missing token',
    schema: {
      example: {
        status: false,
        message: 'invalid token',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category/type not found',
    schema: {
      example: {
        status: false,
        message: 'Category not found',
      },
    },
  })
  @Delete('delete')
  async delete(@Body() deleteCategoryDto: DeleteCategoryDto) {
    return await asyncHandler(this.categoryService.delete(deleteCategoryDto));
  }
}

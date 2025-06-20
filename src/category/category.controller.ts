import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { DeleteCategoryDto } from './dto/delete-category.dto';
import { GetAllCategoriesDto } from './dto/get-all-categories.dto';
import { AccountAuthGuard } from 'src/common/guards/account.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AccountRole } from 'src/account/enums/account-role.enum';

@ApiTags('Categories')
@ApiBearerAuth('JWT-auth')
@UseGuards(AccountAuthGuard, RolesGuard)
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiOperation({
    summary: 'Get all categories',
    description:
      'Retrieves all categories and their associated types. Each category contains an array of types, where each type is represented as an object with a type property. The response maintains the hierarchical relationship between categories and their types.',
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
        message: 'Invalid token',
      },
    },
  })
  @Roles(AccountRole.CC, AccountRole.SUPERADMIN, AccountRole.MANAGER)
  @Get('')
  async getAllCategories() {
    return await this.categoryService.getAll();
  }

  @ApiOperation({
    summary: 'Create new category or type',
    description:
      'Creates a new category or type in the system. If category field is provided, it creates a type under that category. If no category is provided, it creates a new top-level category. The type name must be unique within its parent category. Categories are stored in a flat structure where each category has an array of types.',
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
        message: 'Invalid token',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Category/Item already exists in the specified category',
    schema: {
      example: {
        status: false,
        message: 'Category/Item already exists',
      },
    },
  })
  @Roles(AccountRole.CC, AccountRole.SUPERADMIN, AccountRole.MANAGER)
  @Post('add')
  async add(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.categoryService.add(createCategoryDto);
  }

  @ApiOperation({
    summary: 'Update category or type',
    description:
      'Updates an existing category or type name. Use isCategory flag to specify whether updating a category or a type. For categories, it updates the primary key. For types, it updates the type name within its parent category. The update is performed in a single transaction.',
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
        message: 'Invalid token',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category/type not found',
    schema: {
      example: {
        status: false,
        message: 'Category/type not found',
      },
    },
  })
  @Roles(AccountRole.CC, AccountRole.SUPERADMIN, AccountRole.MANAGER)
  @Patch('update')
  async update(@Body() updateCategoryDto: UpdateCategoryDto) {
    return await this.categoryService.update(updateCategoryDto);
  }

  @ApiOperation({
    summary: 'Delete category or type',
    description:
      "Deletes an existing category or type. Use isCategory flag to specify whether deleting a category or a type. For categories, it removes the entire category record. For types, it removes the type from its parent category's types array. The deletion is performed in a single transaction.",
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
        message: 'Invalid token',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category/type not found',
    schema: {
      example: {
        status: false,
        message: 'Category/type not found',
      },
    },
  })
  @Roles(AccountRole.SUPERADMIN)
  @Delete('delete')
  async delete(@Body() deleteCategoryDto: DeleteCategoryDto) {
    return await this.categoryService.delete(deleteCategoryDto);
  }
}

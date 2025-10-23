import { Controller, Get, UseGuards } from '@nestjs/common';
import { BmsService } from './bms.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AccountAuthGuard } from 'src/common/guards/account.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AccountRole } from 'src/account/enums/account-role.enum';

@ApiBearerAuth('JWT-auth')
@ApiTags('Bms')
@UseGuards(AccountAuthGuard, RolesGuard)
@Controller('bms')
export class BmsController {
  constructor(private readonly bmsService: BmsService) {}

  @ApiOperation({
    summary: 'Get BMS Credentials',
    description: 'Retrieve the BMS credentials for authorized users.',
  })
  @ApiResponse({
    status: 200,
    description: 'BMS credentials retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          example: 'bms_user',
        },
        password: {
          type: 'string',
          example: 'secure_password_123',
        },
      },
    },
  })
  @Roles(
    AccountRole.CC,
    AccountRole.DRIVER,
    AccountRole.SUPERADMIN,
    AccountRole.MANAGER,
  )
  @Get('')
  async getBmsCredentials() {
    return this.bmsService.getBmsCredentials();
  }
}

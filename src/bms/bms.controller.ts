import { Controller, Get, UseGuards } from '@nestjs/common';
import { BmsService } from './bms.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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

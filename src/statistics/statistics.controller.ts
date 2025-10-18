import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AccountAuthGuard } from 'src/common/guards/account.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AccountRole } from 'src/account/enums/account-role.enum';
import { GetTripsQueryDTO } from './dto/get-trips-query.dto';
import { GetCustomersQueryDTO } from './dto/get-customers-query.dto';
import { GetVendorsQueryDTO } from './dto/get-vendors-query.dto';

@ApiTags('Statistics')
@ApiBearerAuth('JWT-auth')
@UseGuards(AccountAuthGuard, RolesGuard)
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Roles(
    AccountRole.MANAGER,
    AccountRole.SUPERADMIN,
    AccountRole.CC,
    AccountRole.DRIVER,
  )
  @Get('trips')
  async getTripStatistics(@Query() tripStatisticsQuery: GetTripsQueryDTO) {
    return this.statisticsService.getTripStatistics(tripStatisticsQuery);
  }

  @Roles(
    AccountRole.MANAGER,
    AccountRole.SUPERADMIN,
    AccountRole.CC,
    AccountRole.DRIVER,
  )
  @Get('customers')
  async getCustomerStatistics(
    @Query() customerStatisticsQuery: GetCustomersQueryDTO,
  ) {
    return this.statisticsService.getCustomerStatistics(
      customerStatisticsQuery,
    );
  }

  @Roles(
    AccountRole.MANAGER,
    AccountRole.SUPERADMIN,
    AccountRole.DRIVER,
    AccountRole.CC,
  )
  @Get('vendors')
  async getVendorStatistics(
    @Query() vendorStatisticsQuery: GetVendorsQueryDTO,
  ) {
    return this.statisticsService.getVendorStatistics(vendorStatisticsQuery);
  }
}

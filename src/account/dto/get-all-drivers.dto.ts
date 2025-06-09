import { ApiProperty } from '@nestjs/swagger';

class DriverData {
  @ApiProperty({
    type: 'string',
    example: '09eea85b-85d3-4d8a-8e41-a6a5af12c546',
  })
  id: string;

  @ApiProperty({ type: 'string', example: 'example example' })
  name: string;

  @ApiProperty({ type: 'string', example: '0999888777' })
  phoneNumber: string;

  @ApiProperty({ type: 'string', example: 'ABC123' })
  assignedVehicleNumber: string;
}

export class GetAllDriversDto {
  @ApiProperty({
    example: true,
    description: 'Operation status',
  })
  status: boolean;

  @ApiProperty({
    type: DriverData,
    description: 'List of all accounts in the system',
    isArray: true,
  })
  data: DriverData[];
}

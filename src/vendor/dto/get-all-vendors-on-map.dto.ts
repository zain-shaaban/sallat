import { ApiProperty } from '@nestjs/swagger';

class location {
  @ApiProperty({ type: 'number', example: 65.565656 })
  lat: number;

  @ApiProperty({ type: 'number', example: 98.989898 })
  lng: number;
}

class GetVendorsOnMapData {
  @ApiProperty({ type:'string',example: '3c559f4a-ef14-4e62-8874-384a89c8689e'})
  vendorID: string;

  @ApiProperty({type:'string', example: 'example example' })
  name: string;

  @ApiProperty({ type: location })
  location: location;
}

export class GetAllVendorsOnMapDto {
  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ type: GetVendorsOnMapData, isArray: true })
  data: GetVendorsOnMapData[];
}

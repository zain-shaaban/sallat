import { ApiProperty } from '@nestjs/swagger';

class location {
  @ApiProperty({ type: 'number', example: 65.565656 })
  lat: number;

  @ApiProperty({ type: 'number', example: 98.989898 })
  lng: number;
}

class GetVendorsOnMapData {
  @ApiProperty({ type:'number',example: 52})
  vendorID: number;

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

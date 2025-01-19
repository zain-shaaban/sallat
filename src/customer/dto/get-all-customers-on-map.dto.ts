import { ApiProperty } from '@nestjs/swagger';
import { Trip } from 'src/trip/entities/trip.entity';
class location {
  @ApiProperty({ type: 'number', example: 65.565656 })
  lat: number;

  @ApiProperty({ type: 'number', example: 98.989898 })
  lng: number;
}

class GetCustomersOnMapData {
  @ApiProperty({ type:'number',example: 52})
  customerID: number;

  @ApiProperty({type:'string', example: 'example example' })
  name: string;

  @ApiProperty({ type: location })
  location: location;
}

export class GetAllCustomersOnMapDto {
  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ type: GetCustomersOnMapData, isArray: true })
  data: GetCustomersOnMapData[];
}

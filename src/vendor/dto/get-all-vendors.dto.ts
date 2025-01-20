import { ApiProperty } from '@nestjs/swagger';
import { Trip } from 'src/trip/entities/trip.entity';
class location {
  @ApiProperty({ type: 'number', example: 65.565656 })
  lat: number;

  @ApiProperty({ type: 'number', example: 98.989898 })
  lng: number;
}

export class GetVendorData {
  @ApiProperty({ type:'number',example: 20 })
  vendorID: number;

  @ApiProperty({ example: '0999888777' })
  phoneNumber: string;

  @ApiProperty({ example: 'example example' })
  name: string;

  @ApiProperty({ type: location })
  location: location;

  @ApiProperty({type:'boolean',example:false})
  partner:boolean

  @ApiProperty({type:'string',example:'example@gmail.com'})
  email:string

  @ApiProperty({ type: Trip, isArray: true })
  trips: Trip[];
}

export class GetAllVendorsDto2 {
  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ type: GetVendorData, isArray: true })
  data: GetVendorData[];
}

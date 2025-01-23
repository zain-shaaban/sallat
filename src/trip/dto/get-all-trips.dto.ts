import { ApiProperty } from '@nestjs/swagger';
import { Trip } from '../entities/trip.entity';

// export class GetAllTripsDto {
//   @ApiProperty({ type: 'number', example: 20 })
//   tripID: number;

//   @ApiProperty({ type: 'number', example: 50 })
//   ccID: number;

//   @ApiProperty({ type: 'number', example: 23 })
//   driverID: number;

//   @ApiProperty({ type: 'number', example: 18 })
//   vendorID: number;

//   @ApiProperty({ type: 'number', example: 11 })
//   customerID: number;

//   @ApiProperty({ type: 'string', example: '123456' })
//   vehicleNumber: string;

//   @ApiProperty({ type: 'boolean', example: false })
//   alternative: boolean;

//   @ApiProperty({ type: 'boolean', example: false })
//   partnership: boolean;

//   @ApiProperty({ type: 'array', example: ['شاورما', 'بطاطا مقلية'] })
//   itemTypes: string[];

//   @ApiProperty({ type: 'string', example: 'كتر كتشب' })
//   description: string;

//   @ApiProperty({ type: 'number', example: 4545.23 })
//   approxDistance: number;

//   @ApiProperty({ type: 'number', example: 888.666 })
//   distance: number;

//   @ApiProperty({ type: 'number', example: 6000.0 })
//   approxPrice: number;

//   @ApiProperty({ type: 'number', example: 6200.0 })
//   price: number;

//   @ApiProperty({ type: 'number', example: 14000.0 })
//   totalPrice: number;

//   @ApiProperty({ type: 'number', example: 6666 })
//   approxTime: number;

//   @ApiProperty({ type: 'number', example: 9000.0 })
//   time: number;

//   @ApiProperty({
//     type: 'array',
//     example: [{lng:555.555,lat:111.111},{lng:456.456,lat:123.123},{lng:887.778,lat:995.111}],
//   })
//   path: string[];

//   @ApiProperty({ type: 'boolean', example: true })
//   success: boolean;
// }

export class GetAllTripsDto{
    @ApiProperty({type:"boolean",example:true})
    status:boolean

    @ApiProperty({type:Trip,isArray:true})
    data:Trip[]
}
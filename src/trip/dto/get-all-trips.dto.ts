import { ApiProperty } from '@nestjs/swagger';
import { Trip } from '../entities/trip.entity';

export class GetAllTripsDto{
    @ApiProperty({type:"boolean",example:true})
    status:boolean

    @ApiProperty({type:Trip,isArray:true})
    data:Trip[]
}
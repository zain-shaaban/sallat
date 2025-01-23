import { ApiProperty } from "@nestjs/swagger"
import { Trip } from "../entities/trip.entity"

export class GetSingleTripDto{
    @ApiProperty({type:"boolean",example:true})
    status:boolean

    @ApiProperty({type:Trip})
    data:Trip
}
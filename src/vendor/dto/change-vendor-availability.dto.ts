import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty } from "class-validator";

export class ChangeAvailabilityDto{
    @ApiProperty({
        type:'boolean',
        description:'Determine if delivery is available for stores.'
    })
    @IsBoolean()
    @IsNotEmpty()
    availability:boolean
}
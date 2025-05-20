import { IsNumber, IsString, IsArray } from 'class-validator';

export class CreateSessionDto {
    @IsNumber()
    startDate: number;

    @IsString()
    color: string;

    @IsString()
    driverID: string;
    
    @IsString()
    vehicleNumber: string;

    @IsArray()
    locations: any[];

    @IsNumber()
    number: number;
}
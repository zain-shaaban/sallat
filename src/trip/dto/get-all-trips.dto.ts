import { ApiProperty } from '@nestjs/swagger';
import { Trip } from '../entities/trip.entity';

class BmsDto {
  @ApiProperty({
    type: String,
    description: 'BMS user name',
    example: 'example',
  })
  username: string;

  @ApiProperty({
    type: String,
    description: 'BMS password',
    example: 'example123',
  })
  password: string;
}

class GetAllTripsData {
  @ApiProperty({
    type: Trip,
    isArray: true,
    description: 'Trip details',
    example: [
      {
        tripID: '0c2b3fe4-9305-4630-ad59-dd2b6db22081',
        ccID: '4d559f4a-ef14-4e62-8874-384a89c8689f',
        driverID: '45aa7a9f-f527-4e42-a77b-58c8e6943a30',
        vehicleNumber: 'ABC123',
        alternative: false,
        itemTypes: ['شاورما', 'بطاطا مقلية'],
        tripState: {
          tripStart: {
            time: 1746897408644,
            location: {
              coords: {
                lat: 34.8927913,
                lng: 35.8892754,
              },
            },
          },
          onVendor: {
            time: 1746897413659,
            location: {
              coords: {
                lat: 34.8927543,
                lng: 35.8892337,
              },
              approximate: false,
            },
          },
          leftVendor: {
            time: 1746898187698,
          },
          tripEnd: {
            time: 1746898200564,
            location: {
              coords: {
                lat: 34.8882025,
                lng: 35.8815156,
              },
              approximate: false,
            },
          },
        },
        description: 'كتر كتشب',
        partner: false,
        approxDistance: 2123.5,
        distance: 1954,
        unpaidDistance: 350,
        approxPrice: 9247,
        isSMSSent:false,
        price: 8908,
        fixedPrice: 9000,
        discounts: {
          item: 0.2,
          delivery: 0.4,
        },
        itemPrice: 25000,
        approxTime: '6',
        time: '791920',
        schedulingDate: Date.now(),
        rawPath: [
          {
            lat: 34.8927543,
            lng: 35.8892337,
          },
          {
            lat: 34.8882025,
            lng: 35.8815156,
          },
        ],
        routedPath: [
          {
            lat: 34.88976,
            lng: 35.88066,
          },
          {
            lat: 34.89222,
            lng: 35.8933,
          },
        ],
        unpaidPath: [
          {
            lat: 34.8927543,
            lng: 35.8892337,
          },
          {
            lat: 34.8882025,
            lng: 35.8815156,
          },
        ],
        matchedPath: [
          [34.892714, 35.88931],
          [34.888192, 35.881591],
        ],
        status: 'success',
        reason: null,
        tripNumber: 1,
        createAt: '2025-05-09T11:28:41.131Z',
        receipt: [
          {
            name: 'شاورما',
            price: 25000,
          },
        ],
        customer: {
          customerID: 'f6273e8a-7088-485c-8c0c-d963c86778d0',
          name: 'احمد حسن',
          phoneNumbers: ['0987654321', '0912345678'],
          location: {
            coords: {
              lat: 34.8882025,
              lng: 35.8815156,
            },
            approximate: false,
            description: 'بجانت بزوريات البركة',
          },
        },
        vendor: {
          vendorID: '42dc6816-ec4f-4016-9a8d-4857baf0cd95',
          phoneNumber: '0988778877',
          name: 'فلافل الاصيل',
          location: {
            coords: {
              lat: 34.8927543,
              lng: 35.8892337,
            },
            approximate: false,
            description: 'قرب المحافظة',
          },
        },
      },
    ],
  })
  trips: Trip[];

  @ApiProperty({
    type: BmsDto,
    description:"BMS crednetails"
  })
  bms: BmsDto;
}

export class GetAllTripsDto {
  @ApiProperty({ type: 'boolean', example: true })
  status: boolean;

  @ApiProperty({
    type: GetAllTripsData,
    description: 'Response data',
  })
  data: GetAllTripsData;
}

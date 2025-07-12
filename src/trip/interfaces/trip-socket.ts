import { CoordinatesDto, LocationDto } from 'src/customer/dto/location.dto';

export interface ITripInSocketsArray {
  tripID: string;
  driverID: string;
  ccID: string;
  customer: {
    customerID: string;
    phoneNumber: string;
    name: string;
    location: LocationDto;
    alternativePhoneNumbers: string[];
  };
  vendor: {
    vendorID: string;
    phoneNumber: string;
    name: string;
    location: LocationDto;
  };
  vehicleNumber: string;
  alternative: boolean;
  partner: boolean;
  tripState: {
    tripStart?: {
      time: number;
      location: LocationDto;
    };
    tripEnd?: {
      time?: number;
      location?: LocationDto;
    };
    onVendor?: {
      time?: number;
      location?: LocationDto;
    };
    leftVendor?: {
      time?: number;
    };

    wayPoints?: {
      location: LocationDto;
      time: number;
      type: string;
    }[];
  };

  description: string;

  approxDistance: number;

  distance: number;

  approxPrice: number;

  price: number;

  itemPrice: number;

  approxTime: number;

  time: number;

  itemTypes: string[];

  rawPath: CoordinatesDto[];

  routedPath: CoordinatesDto[];

  matchedPath: [number, number][];

  receipt: { name: string; price: number }[];

  status: string;

  reason: string;

  tripNumber: number;

  discounts: { item: number; delivery: number };

  fixedPrice:number
}

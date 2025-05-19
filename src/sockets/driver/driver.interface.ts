import { CoordinatesDto } from 'src/customer/dto/location.dto';

export interface IDriver {
  socketID: string | null;
  driverID: string;
  location: CoordinatesDto;
  available: boolean;
  lastLocation: number;
  notificationSent: boolean;
}

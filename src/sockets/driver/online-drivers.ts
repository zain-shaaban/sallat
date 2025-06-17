import { Injectable } from '@nestjs/common';
import { IDriver } from './driver.interface';

@Injectable()
export class OnlineDrivers {
  public drivers: IDriver[] = [];
}

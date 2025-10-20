import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BmsService {
  constructor(private readonly configService: ConfigService) {}

  async getBmsCredentials() {
    return {
      bms: {
        username: this.configService.get('BMS_USERNAME'),
        password: this.configService.get('BMS_PASSWORD'),
      },
    };
  }
}

import { IsString } from 'class-validator';

export class CreateSocketNotificationDto {
  @IsString()
  type: string;

  data: any;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateNotificationTokenDto {
  @ApiProperty({
    example: 'fcm-token-123',
    description: 'Firebase Cloud Messaging token for notifications',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  notificationToken: string;
}

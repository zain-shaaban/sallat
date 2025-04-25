import { Controller } from '@nestjs/common';
import { SocketNotificationService } from './socket-notification.service';

@Controller('socket-notification')
export class SocketNotificationController {
  constructor(private readonly socketNotificationService: SocketNotificationService) {}
}

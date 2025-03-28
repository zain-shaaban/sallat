import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Driver } from 'src/account/driver/entities/driver.entity';
import { FirebaseService } from 'src/firebase/firebase.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { logger } from 'src/common/error_logger/logger.util';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Driver) private driverRepository: Repository<Driver>,
    private readonly firebaseService: FirebaseService,
  ) {}

  async send(createNotificationDto: CreateNotificationDto) {
    const { content, driverID, title } = createNotificationDto;
    const driver = await this.driverRepository.findOneBy({ driverID });
    if (!driver) throw new NotFoundException();
    if (!driver?.notificationToken) {
      logger.error('not found token', '');
      return;
    }
    const message = {
      token: driver.notificationToken,
      notification: {
        title,
        body: content,
      },
    };
    await this.firebaseService.messaging().send(message);
    return null;
  }
}

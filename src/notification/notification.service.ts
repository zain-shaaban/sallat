import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { logger } from 'src/common/error_logger/logger.util';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { DriverMetadata } from 'src/account/entities/driverMetadata.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(DriverMetadata) private driverRepository: Repository<DriverMetadata>,
    private readonly firebaseService: FirebaseService,
  ) {}

  async send(createNotificationDto: CreateNotificationDto) {
    const { content, driverID, title } = createNotificationDto;
    const driver = await this.driverRepository.findOneBy({ id:driverID });
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

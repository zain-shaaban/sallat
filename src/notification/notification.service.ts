import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { logger } from 'src/common/error_logger/logger.util';
import { Notification } from './interfaces/notification.interface';
import { DriverMetadata } from 'src/account/entities/driverMetadata.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(DriverMetadata)
    private driverRepository: Repository<DriverMetadata>,
    private readonly firebaseService: FirebaseService,
  ) {}

  async send({ driverID, title, content }: Notification) {
    const driver = await this.driverRepository.findOneBy({ id: driverID });

    if (!driver)
      throw new NotFoundException(`Driver with ID ${driverID} not found`);

    const message = {
      token: driver.notificationToken,
      notification: {
        title,
        body: content,
      },
    };

    try {
      await this.firebaseService.messaging().send(message);
    } catch (error) {
      logger.error(error.message, error.stack);
      return;
    }
    return null;
  }
}

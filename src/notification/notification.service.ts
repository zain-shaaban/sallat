import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Driver } from 'src/account/driver/entities/driver.entity';
import { FirebaseService } from 'src/firebase/firebase.service';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Driver) private readonly driverModel: typeof Driver,
    private readonly firebaseService: FirebaseService,
  ) {}

  async send(createNotificationDto: CreateNotificationDto) {
    const { content, driverID, title } = createNotificationDto;
    const driver = await this.driverModel.findByPk(driverID);
    if (!driver) throw new NotFoundException();
    if (!driver?.notificationToken)
      throw new NotFoundException('token not found');
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

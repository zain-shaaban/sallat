import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SocketNotification } from './entities/socket-notification.entity';
import { Repository } from 'typeorm';
import { CreateSocketNotificationDto } from './dto/create-socket-notification.dto';

@Injectable()
export class SocketNotificationService {
    constructor(
        @InjectRepository(SocketNotification) private socketNotificationRepo: Repository<SocketNotification>
    ) {}

    async create(createSocketNotification: CreateSocketNotificationDto) {
        this.socketNotificationRepo.create(createSocketNotification);
    }
}
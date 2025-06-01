import { Injectable } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './entities/session.entity';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session) private sessionRepository: Repository<Session>,
  ) {}

  async create(createSessionDto: CreateSessionDto) {
    const session = this.sessionRepository.create(createSessionDto);
    const { sessionID } = await this.sessionRepository.save(session);
    return { sessionID };
  }

  async createMultiple(sessions: CreateSessionDto[]) {
    const sessionEntities = this.sessionRepository.create(sessions);

    const savedSessions = await this.sessionRepository.save(sessionEntities);

    const sessionIDs = savedSessions.map(({ sessionID }) => sessionID);

    return { sessionIDs };
  }

  async findAll() {
    const sessions = await this.sessionRepository.find();
    return sessions;
  }

  async findByDriverID(driverID: string) {
    return this.sessionRepository.find({
      where: { driverID },
      order: { startDate: 'ASC' },
    });
  }

  async findByVehicleNumber(vehicleNumber: string) {
    return this.sessionRepository.find({
      where: { vehicleNumber },
      order: { startDate: 'ASC' },
    });
  }

  async findByDriverAndVehicle(driverID: string, vehicleNumber: string) {
    return this.sessionRepository.find({
      where: {
        driverID,
        vehicleNumber,
      },
      order: { startDate: 'ASC' },
    });
  }

  async removeAll() {
    await this.sessionRepository.clear();
    return null;
  }
}

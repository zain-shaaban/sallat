import { Injectable } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './entities/session.entity';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session) private sessionRepository: Repository<Session>
  ) {}

  async create(createSessionDto: CreateSessionDto) {
    const session = this.sessionRepository.create(createSessionDto);
    const sessionID = (await this.sessionRepository.save(session)).sessionID
    return { sessionID };
  }

  async createMultiple(sessions: CreateSessionDto[]) {
    const sessionEntities = this.sessionRepository.create(
      sessions.map(session => ({
        startDate: session.startDate,
        color: session.color,
        driverID: session.driverID,
        vehicleNumber: session.vehicleNumber,
        locations: session.locations,
        number: session.number
      }))
    );

    const savedSessions = await this.sessionRepository.save(sessionEntities);

    const sessionIDs = savedSessions.map(session => ({ sessionID: session.sessionID }));
    
    return { sessionIDs };
  }

  async findAll() {
    const sessions = await this.sessionRepository.find();
    return plainToInstance(Session, sessions);
  }

  async findByDriverID(driverID: string) {
    return this.sessionRepository.find({ 
      where: { driverID },
      order: { startDate: 'DESC' } 
    });
  }

  async findByVehicleNumber(vehicleNumber: string) {
    return this.sessionRepository.find({ 
      where: { vehicleNumber },
      order: { startDate: 'DESC' }
    });
  }

  async findByDriverAndVehicle(driverID: string, vehicleNumber: string) {
    return this.sessionRepository.find({
      where: { 
        driverID,
        vehicleNumber 
      },
      order: { startDate: 'DESC' }
    });
  }

  async removeAll() {
    await this.sessionRepository
      .createQueryBuilder()
      .delete()
      .from(Session)
      .execute();

    return;
  }
}

import { Log } from './entities/log.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { LogDto } from './dto/log.dto';

@Injectable()
export class LoggingService {
  constructor(
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>
  ) {}
  
  async createLog(payload: LogDto): Promise<Log> {
    const logEntry = this.logRepository.create({
      userId: payload.userId,
      actionType: payload.actionType,
      targetId: payload.targetId,
      payloadBefore: payload.payloadBefore,
      payloadAfter: payload.payloadAfter,
      payloadInfo: payload.payloadInfo,
    });
    return this.logRepository.save(logEntry)
  }
}

import { Injectable } from '@nestjs/common';
import { LoggingService } from './logging.service';
import { OnEvent } from '@nestjs/event-emitter';
import { LogDto } from './dto/log.dto';

@Injectable()
export class LoggingListener {
  constructor(private readonly loggingService: LoggingService) {}
  
  @OnEvent('log.action')
  handleLogActionEvent(payload: any) {
    console.log('Logging event received:', payload);
    this.loggingService.createLog(payload)
  }
}

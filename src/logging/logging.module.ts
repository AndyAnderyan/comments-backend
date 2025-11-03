import { TypeOrmModule } from '@nestjs/typeorm';
import { Log } from './entities/log.entity';
import { Module } from '@nestjs/common';
import { LoggingListener } from './logging.listener';
import { LoggingService } from './logging.service';

@Module({
  imports: [TypeOrmModule.forFeature([Log])],
  providers: [LoggingService, LoggingListener],
  exports: [LoggingService]
})
export class LoggingModule {}

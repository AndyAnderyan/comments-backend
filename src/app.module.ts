import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsModule } from './comments/comments.module';
import { LoggingModule } from './logging/logging.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CommentsController } from './comments/comments.controller';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      
      // useFactory поверне конфігурацію для TypeORM
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        
        // 4. Зчитуємо дані з .env
        // (які Docker Compose передав у контейнер)
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        
        // 5. autoLoadEntities вирішує проблему з UnknownDependenciesException
        autoLoadEntities: true,
        
        // 6. synchronize: true автоматично створить таблиці в БД
        // (Тільки для розробки! Не використовуйте в production.)
        synchronize: true,
      }),
    }),
    EventEmitterModule.forRoot(),
    CommentsModule,
    UsersModule,
    AuthModule,
    LoggingModule,
    NotificationsModule,
  ],
})
export class AppModule {}

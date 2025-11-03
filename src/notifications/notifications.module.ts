import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config'
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.geteway';
import { NotificationsListener } from './notifications.listener';
import { Notification } from './entities/notification.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    // Налаштовуємо JwtModule, щоб Gateway міг валідувати токени
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '60s' }, // Неважливо для верифікації
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    NotificationsService,
    NotificationsGateway,
    NotificationsListener
  ]
})
export class NotificationsModule {}

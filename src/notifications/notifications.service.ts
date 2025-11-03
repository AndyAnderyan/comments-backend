import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { Repository } from 'typeorm';
import { NotificationsGateway } from './notifications.geteway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @Inject(forwardRef(() => NotificationsGateway)) // <-- Оберніть ін'єкцію
    private readonly notificationsGateway: NotificationsGateway,
  ) {}
  
  async createNotification(
    userId: string,
    type: NotificationType,
    message: string,
    link: string,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      userId,
      type,
      message,
      link,
    });
    
    const savedNotification = await this.notificationRepository.save(notification)
    // Відправляємо real-time сповіщення
    this.notificationsGateway.sendNotificationToUser(userId, savedNotification);
    
    const unreadCount = await this.getUnreadCount(userId)
    this.notificationsGateway.updateUnreadCount(userId, unreadCount);
    
    return savedNotification;
  }
  
  // TODO: реалізувати функцію збору кількості непрочитаних повідомлень для юзера
  async getUnreadCount(userId: any) {
    return this.notificationRepository.count({
      where: { userId, isRead: false },
    })
  }
}

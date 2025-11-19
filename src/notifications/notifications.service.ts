import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { Like, Repository } from 'typeorm';
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
    // Відправляємо real-time сповіщеннял
    this.notificationsGateway.sendNotificationToUser(userId, savedNotification);
    
    const unreadCount = await this.getUnreadCount(userId)
    this.notificationsGateway.updateUnreadCount(userId, unreadCount);
    
    return savedNotification;
  }
  
  async getUnreadCount(userId: any) {
    return this.notificationRepository.count({
      where: { userId, isRead: false },
    })
  }
  
  async markCommentsNotificationAsRead(commentId: string, userId: string): Promise<void> {
    // На основі 'NotificationsListener', посилання містить `commentId=...`
    const linkSearchString = `commentId=${commentId}`;
    
    await this.notificationRepository.update(
      {
        userId: userId,
        isRead: false,
        link: Like(`%${linkSearchString}%`), // Шукаємо посилання, що містить ID коментаря
      },
      {
        isRead: true,
      }
    );
  }
}

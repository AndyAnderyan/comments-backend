import { Injectable } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { OnEvent } from '@nestjs/event-emitter';
import { User } from '../users/entities/user.entity';
import { Comment } from '../comments/entities/comment.entity'
import { NotificationType } from './entities/notification.entity';

interface CommentCreatedPayload {
  comment: Comment;
  notifiedUserIds: string[];
  author: User;
}

@Injectable()
export class NotificationsListener {
  constructor(private readonly notificationsService: NotificationsService) {}
  
  @OnEvent('comment.created')
  async handleCommentCreatedEvent(payload: CommentCreatedPayload) {
    const { comment, notifiedUserIds, author } = payload;
    
    // Створюємо сповіщення для кожного обраного користувача
    for (const userId of notifiedUserIds) {
      if (userId === author.id) continue;
      
      const message = `Новий ${comment.parentId ? 'відповідь' : 'коментар'} від ${author.name}: "${comment.text.substring(0, 50)}..."`;
      
      // TODO: Сформувати правильне посилання на об'єкт/коментар
      const link = `/map?objectTypeId=${comment.objectTypeId}&objectId=${comment.objectId}&commentId=${comment.id}`;
      
      await this.notificationsService.createNotification(
        userId,
        NotificationType.NEW_COMMENT,
        message,
        link
      );
    }
  }
  
  @OnEvent('comment.read')
  handleCommentReadEvent(payload: { commentId: string, userId: string }) {
    // TODO: Тут має бути логіка оновлення isRead для Notification і відправка оновленого лічильника через Gateway.
    // Індикатор нових сповіщень активний до моменту прочитання коментаря
    // Якщо прочитання коментаря = прочитання сповіщення
    // Наприклад:
    // await this.notificationsService.markNotificationAsReadByComment(payload.commentId, payload.userId);
  }
}

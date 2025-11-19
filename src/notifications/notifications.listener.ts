import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationType } from './entities/notification.entity';
import { NotificationsGateway } from './notifications.geteway';
import type { CommentUpdatedPayload } from './payloads/comment-updated.payload';
import type { CommentHiddenPayload } from './payloads/comment-hidden.payload';
import type { CommentCreatedPayload } from './payloads/comment-created.payload';
import type { CommentReadPayload } from './payloads/comment-read.payload';
import type { CommentDeletedPayload } from './payloads/comment-deleted.payload';
import type { CommentPinnedPayload } from './payloads/comment-pinned.payload';
import { EntityName } from './dicts/entity-name.enum';
import { EventType } from './dicts/event-type.enum';

@Injectable()
export class NotificationsListener {
  constructor(
    private readonly notificationsService: NotificationsService,
    @Inject(forwardRef(() => NotificationsGateway))
    private readonly notificationsGateway: NotificationsGateway
  ) {}
  
  @OnEvent(`${ EntityName.comment }.${ EventType.created }`)
  async handleCommentCreatedEvent(payload: CommentCreatedPayload) {
    const { comment, recipientsIds, author } = payload;
    
    // Створюємо сповіщення для кожного обраного користувача
    for (const userId of recipientsIds) {
      if (userId === author.id) continue;
      
      const message = `Новий ${comment.parentId ? 'відповідь' : 'коментар'} від ${author.name}: "${comment.text.substring(0, 50)}..."`;
      const link = `/map?objectTypeId=${comment.objectTypeId}&objectId=${comment.objectId}&commentId=${comment.id}`;
      
      await this.notificationsService.createNotification(
        userId,
        NotificationType.NEW_COMMENT,
        message,
        link
      );
    }
    
    this.notificationsGateway.broadcastEvent(`${ EntityName.comment }.${ EventType.created }`, {
      comment
    })
  }
  
  @OnEvent(`${ EntityName.comment }.${ EventType.updated }`)
  handleCommentUpdateEvent(payload: CommentUpdatedPayload) {
    this.notificationsGateway.broadcastEvent(`${ EntityName.comment }.${ EventType.updated }`, {
      comment: payload.comment
    })
  }
  
  @OnEvent(`${ EntityName.comment }.${ EventType.hidden }`) handleCommentHiddenEvent(payload: CommentHiddenPayload) {
    this.notificationsGateway.broadcastEvent(`${ EntityName.comment }.${ EventType.hidden }`, {
      id: payload.id,
      isHidden: payload.isHidden
    })
  }
  
  @OnEvent(`${ EntityName.comment }.${ EventType.deleted }`) handleCommentDeletedEvent(payload: CommentDeletedPayload) {
    this.notificationsGateway.broadcastEvent(`${ EntityName.comment }.${ EventType.deleted }`, {
      id: payload.comment.id
    })
  }
  
  @OnEvent(`${ EntityName.comment }.${ EventType.pinned }`) handleCommentPinnedEvent(payload: CommentPinnedPayload) {
    this.notificationsGateway.broadcastEvent(`${ EntityName.comment }.${ EventType.pinned }`, {
      objectKey: {
        objectTypeId: payload.objectTypeId,
        objectId: payload.objectId
      },
      pinnedCommentId: payload.pinnedCommentId
    })
  }
  
  @OnEvent(`${ EntityName.comment }.${ EventType.read }`)
  async handleCommentReadEvent(payload: CommentReadPayload) {
    this.notificationsGateway.broadcastEvent(`${ EntityName.comment }.${ EventType.read }`, {
      id: payload.commentId,
      userId: payload.userId,
      read: true
    });
    
    // Позначаємо *саму нотифікацію* як прочитану.
    await this.notificationsService.markCommentsNotificationAsRead(payload.commentId, payload.userId);
    
    // Оновлюємо лічильник у користувача, який прочитав коментар
    const unreadCount = await this.notificationsService.getUnreadCount(payload.userId);
    this.notificationsGateway.updateUnreadCount(payload.userId, unreadCount);
  }
}

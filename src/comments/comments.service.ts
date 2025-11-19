import {
  NotFoundException,
  BadRequestException, Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository, FindOptionsWhere, In } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter'; // Для подій
import { Comment } from './entities/comment.entity';
import { User } from '../users/entities/user.entity';
import { CommentCreateDto } from './dto/comment-create.dto';
import { CommentUpdateDto } from './dto/comment-update.dto';
import { CommentQueryDto } from './dto/comment-query.dto';
import { CommentReadStatus } from './entities/comment-read-status.entity';
import { CommentNotification } from './entities/comment-notification.entity';
import { Role } from '../users/dicts/role.enum';
import { ResponsePaginationDto } from '../common/dto/response-pagination.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { LogDto } from '../logging/dto/log.dto';
import { EntityName } from '../notifications/dicts/entity-name.enum';
import { EventType } from '../notifications/dicts/event-type.enum';
import { ActionType } from '../notifications/dicts/action-type.enum';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: TreeRepository<Comment>,
    
    @InjectRepository(CommentReadStatus)
    private readonly readStatusRepository: Repository<CommentReadStatus>,
    
    @InjectRepository(CommentNotification)
    private readonly commentNotificationRepository: Repository<CommentNotification>,
    
    private readonly eventEmitter: EventEmitter2,
  ) {
  }
  
  async crete(dto: CommentCreateDto, author: User): Promise<Comment> {
    const newComment = this.commentRepository.create({
      text: dto.text,
      author: author,
    });
    
    let parentComment: Comment | null = null;
    let objectTypeId = dto.objectTypeId;
    let objectId = dto.objectId;
    let level = 0;
    let rootCommentId: string | null = null;
    
    if (dto.parentId) {
      parentComment = await this.commentRepository.findOneBy({
        id: dto.parentId,
      });
      if (!parentComment) {
        throw new NotFoundException(
          `Parent comment with ID ${dto.parentId} not found`,
        );
      }
      
      newComment.parent = parentComment;
      level = parentComment.level + 1;
      
      objectTypeId = parentComment.objectTypeId;
      objectId = parentComment.objectId;
      
      if (parentComment.rootCommentId) {
        rootCommentId = parentComment.rootCommentId
      } else {
        rootCommentId = parentComment.id
      }
      
    } else if (!objectTypeId || !objectId) {
      throw new BadRequestException('objectTypeId and objectId are required for a new comment');
    }
    
    newComment.objectTypeId = objectTypeId;
    newComment.objectId = objectId;
    newComment.level = level;
    newComment.rootCommentId = rootCommentId;
    
    const savedComment = await this.commentRepository.save(newComment);
    
    if (dto.recipientsIds && dto.recipientsIds.length > 0) {
      await this.handleNotifications(savedComment.id, dto.recipientsIds);
      this.eventEmitter.emit(`${EntityName.comment}.${EventType.created}`, {
        comment: savedComment,
        notifiedUserIds: dto.recipientsIds,
        author,
      });
    }
    
    this.eventEmitter.emit(`${EntityName.log}.${EventType.created}}`, {
      userId: author.id,
      actionType: `${ActionType.create}.${EntityName.comment}`,
      targetId: savedComment.id,
      payloadAfter: savedComment,
    });
    
    await this.markAsRead(savedComment.id, author.id);
    
    return savedComment;
  }
  
  async update(id: string, dto: CommentUpdateDto, user: User): Promise<Comment> {
    const comment = await this.findCommentById(id);
    const oldPayload = { ...comment };
    
    comment.text = dto.text;
    
    if (dto.recipientsIds) {
      await this.handleNotifications(id, dto.recipientsIds);
      // TODO: Подія для оновлення сповіщення
    }
    
    const updatedComment = await this.commentRepository.save(comment);
    
    this.eventEmitter.emit(`${EntityName.comment}.${EventType.updated}`, {
      comment: updatedComment
    })
    
    this.eventEmitter.emit(`${EntityName.log}.${EventType.created}`, {
      userId: user.id,
      actionType: `${ActionType.update}.${EntityName.comment}`,
      targetId: id,
      payloadBefore: oldPayload,
      payloadAfter: updatedComment
    });
    
    return updatedComment;
  }
  
  async hide(id: string, user: User): Promise<void> {
    const comment = await this.findCommentById(id);
    
    const descendants = await this.commentRepository.findDescendants(comment);
    const idsToHide = descendants.map(d => d.id);
    
    await this.commentRepository.update({ id: In(idsToHide) }, { isHidden: true })
    
    this.eventEmitter.emit(`${EntityName.comment}.${EventType.hidden}`, {
      objectTypeId: comment.objectTypeId,
      objectId: comment.objectId,
      id: comment.id,
      isHidden: true
    })
    
    this.eventEmitter.emit(`${EntityName.log}.${EventType.created}`, {
      userId: user.id,
      actionType: `${ActionType.hide}.${EntityName.comment}`,
      targetId: id,
      payloadInfo: `Comment ${id} and ${idsToHide.length - 1} children hidden.`,
    });
  }
  
  async hardDelete(id: string, user: User): Promise<void> {
    const comment = await this.findCommentById(id);
    
    // TreeRepository.remove() автоматично видаляє всіх нащадків
    await this.commentRepository.remove(comment);
    
    this.eventEmitter.emit(`${EntityName.comment}.${EventType.deleted}`, {
      objectTypeId: comment.objectTypeId,
      objectId: comment.objectId,
      id: id,
    })
    
    this.eventEmitter.emit(`${EntityName.log}.${EventType.created}`, {
      userId: user.id,
      actionType: `${ActionType.delete}.${EntityName.comment}`,
      targetId: id,
      payloadBefore: comment,
    })
  }
  
  async pin(id: string, user: User) {
    const commentToPin = await this.findCommentById(id);
    
    await this.commentRepository.manager.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.update(
        Comment,
        {
          objectTypeId: commentToPin.objectTypeId,
          objectId: commentToPin.objectId,
          isPinned: true
        },
        { isPinned: false }
      );
      
      commentToPin.isPinned = true;
      await transactionalEntityManager.save(commentToPin);
    });
    
    this.eventEmitter.emit(`${EntityName.comment}.${EventType.pinned}`, {
      objectTypeId: commentToPin.objectTypeId,
      objectId: commentToPin.objectId,
      pinnedCommentId: commentToPin.id
    })
    
    this.eventEmitter.emit(`${EntityName.log}.${EventType.created}`, {
      userId: user.id,
      actionType: `${ActionType.pin}.${EntityName.comment}`,
      targetId: id,
    })
    
    return commentToPin;
  }
  
  async unpin(id: string, user: User): Promise<Comment> {
    const comment = await this.findCommentById(id);
    comment.isPinned = false;
    
    const unpinnedComment = await this.commentRepository.save(comment);
    
    this.eventEmitter.emit(`${EntityName.comment}.${EventType.pinned}`, {
      objectTypeId: unpinnedComment.objectTypeId,
      objectId: unpinnedComment.objectId,
      pinnedCommentId: null,
    })
    
    this.eventEmitter.emit(`${EntityName.log}.${EventType.created}`, {
      userId: user.id,
      actionType: `${ActionType.unpin}.${EntityName.comment}`,
      targetId: id,
    })
    
    return unpinnedComment;
  }
  
  async markAsRead(commentId: string, userId: string) {
    const exists = await this.readStatusRepository.findOneBy({ commentId, userId });
    
    if (!exists) {
      const readStatus = this.readStatusRepository.create({ commentId, userId })
      await this.readStatusRepository.save(readStatus);
      
      // Подія для оновлення індикатора нотифікацій в реальному часі
      this.eventEmitter.emit(`${EntityName.comment}.${EventType.read}`, { commentId, userId })
    }
  }
  
  async findThreadReplies(
    rootId: string,
    query: CommentQueryDto,
    currentUserId: string,
  ): Promise<ResponsePaginationDto<CommentResponseDto>> {
    const { page = 1, limit = 50 } = query; // Для чату ліміт зазвичай більший
    const skip = (page - 1) * limit;
    
    // Перевіримо, чи існує тема
    const rootExists = await this.commentRepository.findOneBy({ id: rootId });
    if (!rootExists) {
      throw new NotFoundException(`Thread (Root Comment) with ID ${rootId} not found`);
    }
    
    const qb = this.commentRepository.createQueryBuilder('comment');
    
    // Вибираємо всі коментарі, де rootCommentId = нашому ID
    qb.where('comment.rootCommentId = :rootId', { rootId });
    
    // Якщо це не адмін, не показуємо приховані
    if (!query.isShowHidden) {
      qb.andWhere('comment.isHidden = false');
    }
    
    // Сортування як у чаті: старі зверху (хронологія)
    qb.orderBy('comment.createdAt', 'ASC');
    
    // Пагінація
    qb.skip(skip).take(limit);
    
    // Зв'язки (Relations)
    qb.leftJoinAndSelect('comment.author', 'author')
      .leftJoinAndSelect('comment.notifications', 'notifications')
      .leftJoinAndSelect('notifications.user', 'notifiedUser')
      // Load read status for current user
      .leftJoinAndSelect('comment.readStatuses', 'readStatuses', 'readStatuses.userId = :currentUserId', { currentUserId });
    
    const [comments, total] = await qb.getManyAndCount();
    
    const data = comments.map(comment => this.transformCommentResponse(comment, currentUserId));
    
    return { data, total, page, limit };
  }
  
  async findAll(query: CommentQueryDto, currentUserId: string): Promise<ResponsePaginationDto<CommentResponseDto>> {
    const {
      page = 1, limit = 20, objectTypeId, objectId, authorId, searchText, topLevelOnly, isShowHidden, sortBy = 'createdAt', sortOrder = "DESC"
    } = query;
    
    const skip = (page - 1) * limit;
    
    const qb = this.commentRepository.createQueryBuilder('comment');
    
    const where: FindOptionsWhere<Comment> = {};
    if (objectTypeId && objectId) {
      where.objectTypeId = objectTypeId;
      where.objectId = objectId;
    }
    if (authorId) where.authorId = authorId;
    if (topLevelOnly) where.parentId = undefined;
    if (!isShowHidden) where.isHidden = false;
    
    qb.where(where);
    
    if (searchText) {
      qb.andWhere('comment.text ILIKE :searchText', { searchText: `%${searchText}%` })
    }
    
    qb.orderBy('comment.isPinned', 'DESC')
      .addOrderBy(`comment.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit);
    
    qb.leftJoinAndSelect('comment.author', 'author')
      .leftJoinAndSelect('comment.notifications', 'notifications')
      .leftJoinAndSelect('notifications.user', 'notifiedUser')
      .leftJoinAndSelect('comment.readStatuses', 'readStatuses', 'readStatuses.userId = :currentUserId', { currentUserId })
      .loadRelationCountAndMap('comment.repliesCount', 'comment.children');
    
    const [comments, total] = await qb.getManyAndCount();
    
    const data = comments.map(comment => this.transformCommentResponse(comment, currentUserId));
    
    return { data, total, page, limit }
  }
  
  private transformCommentResponse(comment: Comment, currentUserId: string) {
    const isRead = comment.readStatuses && comment.readStatuses.length > 0;
    const recipients = (comment.notifications || []).map(n => n.user);
    
    const isNotifiedToMeAndUnread = recipients.some(u => u.id === currentUserId) && !isRead;
    
    const responseDto: CommentResponseDto = {
      ...comment,
      recipients,
      isRead,
      isNotifiedToMeAndUnread,
      // @ts-ignore (repliesCount додається динамічно через loadRelationCountAndMap)
      repliesCount: comment.repliesCount,
    }
    
    return responseDto
  }
  
  async findObjectsWithComments(query: any, user: User) {
    const qb = this.commentRepository.createQueryBuilder('comment')
      .select('comment.objectTypeId', 'objectTypeId')
      .addSelect('comment.objectId', 'objectId')
      .addSelect('MAX(comment.createdAt)', 'lastCommentDate')
      .addSelect('COUNT(comment.id)', 'commentCount')
      .groupBy('comment.objectTypeId, comment.objectId');
    
    if (user.role !== Role.admin) {
      qb.where('comment.isHidden = false');
    }
    
    if (query.sortBy === 'last_comment_date') {
      qb.orderBy('lastCommentDate', query.sortOrder || 'DESC');
    }
    
    // TODO: ... Потрібно додати логіку пагінації ...
    
    const results = await qb.getRawMany();
    
    // TODO: Потрібно додати логіку для отримання "назви об'єкта".
    // Це вимагатиме інжекції сервісу, що відповідає за об'єкти мапи.
    // Наприклад: `mapObjectsService.getNamesByIds(results.map(r => ...))`
    
    return results;
  }
  
  async findCommentById(id: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['author']
    });
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found.`)
    }
    return comment;
  }
  
  private async handleNotifications(commentId: string, notifyUserIds: string[]) {
    await this.commentNotificationRepository.delete({ commentId });
    
    const notifications = notifyUserIds.map(userId => this.commentNotificationRepository.create({ commentId, userId }))
    await this.commentNotificationRepository.save(notifications);
  }
}

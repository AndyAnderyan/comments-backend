import { Comment } from '../../comments/entities/comment.entity';

export interface CommentDeletedPayload {
  comment: Comment
}

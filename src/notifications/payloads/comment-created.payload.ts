import { User } from '../../users/entities/user.entity';
import { Comment } from '../../comments/entities/comment.entity';

export interface CommentCreatedPayload {
  comment: Comment;
  recipientsIds: string[],
  author: User;
}

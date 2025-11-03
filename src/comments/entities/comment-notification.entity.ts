import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Comment } from './comment.entity';

@Entity('comment_notifications')
@Index(['userId', 'commentId'], { unique: true })
export class CommentNotification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Comment, (comment) => comment)
  comment: Comment;

  @Column()
  commentId: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: string;
}

import {
  Column,
  CreateDateColumn, Entity, Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Comment } from './comment.entity';

@Entity('comment_read_statuses')
@Index(['userId', 'commentId'], { unique: true })
export class CommentReadStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Comment, (comment) => comment.readStatuses)
  comment: Comment;
  @Column()
  commentId: string;

  @ManyToOne(() => User)
  user: User;
  @Column()
  userId: string;

  @CreateDateColumn()
  readAt: Date;
}

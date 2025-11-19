import {
  Column,
  CreateDateColumn,
  Entity,
  Index, JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CommentNotification } from './comment-notification.entity';
import { CommentReadStatus } from './comment-read-status.entity';

@Entity('comments')
@Tree('adjacency-list')
@Index(['objectTypeId', 'objectId'])
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 2000 })
  text: string;

  @ManyToOne(() => User, { eager: true }) // `eager: true` автоматично завантажує автора
  author: User;

  @Column()
  authorId: string;

  @Column()
  objectTypeId: string;

  @Column()
  objectId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isHidden: boolean;

  @Column({ default: false })
  isPinned: boolean;

  @TreeChildren()
  children: Comment[];

  @TreeParent()
  parent: Comment;

  @Column({ nullable: true })
  parentId: string;
  
  // --- НОВЕ ПОЛЕ (comentId / rootCommentId) ---
  // Це ID "теми" (найпершого коментаря в ланцюжку)
  @Column({ nullable: true })
  rootCommentId: string | null;
  
  @ManyToOne(() => Comment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rootCommentId' })
  rootComment: Comment;

  @Column({ type: 'int', default: 0 })
  level: number;

  @OneToMany(() => CommentNotification, (notification) => notification.comment)
  notifications: CommentNotification[];

  @OneToMany(() => CommentReadStatus, (readStatus) => readStatus.comment)
  readStatuses: CommentReadStatus[];
}

import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
  NEW_COMMENT = 'NEW_COMMENT',
  MENTION = 'MENTION'
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @ManyToOne(() => User)
  user: User;
  
  @Column()
  @Index()
  userId: string;
  
  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;
  
  @Column()
  message: string;
  
  @Column({ nullable: true })
  link: string;
  
  @Column({ default: false })
  isRead: boolean;
  
  @CreateDateColumn()
  createdAt: Date;
}

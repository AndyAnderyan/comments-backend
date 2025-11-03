import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('logs')
export class Log {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column()
  @Index()
  userId: string;
  
  @Column()
  @Index()
  actionType: string;
  
  @Column({ nullable: true })
  @Index()
  targetId: string;
  
  @Column({ type: 'jsonb', nullable: true })
  payloadBefore: any;
  
  @Column({ type: 'jsonb', nullable: true })
  payloadAfter: any;
  
  @Column({ type: 'text', nullable: true })
  payloadInfo: string;
  
  @CreateDateColumn()
  createdAt: Date;
}

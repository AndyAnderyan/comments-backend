import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../dicts/role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column()
  name: string;
  
  @Column({ unique: true })
  email: string;
  
  @Column({ select: false }) // Не повертати пароль при запитах
  password?: string;
  
  @Column({ type: 'text', default: Role.user })
  role: Role;
}

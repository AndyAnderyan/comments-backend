import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserQueryDto } from './dto/user-query.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  
  async findByEmail(email: string): Promise<User | null> {
    // Додаємо .addSelect('user.password') - бо він прихований за замовчуванням
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.password')
      .getOne();
  }
  
  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOneBy({ id })
  }
  
  async create(user: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(user);
    return this.userRepository.save(newUser);
  }
  
  async search(queryDto: UserQueryDto, currentUserId: string): Promise<[User[], number]> {
    
    const { q, page = 1, limit = 20 } = queryDto;
    const skip = (page - 1) * limit;
    
    const qb = this.userRepository.createQueryBuilder('user')
      .where('user.id != :currentUserId', { currentUserId })
      .select(['user.id', 'user.name'])
      .skip(skip)
      .take(limit);
    
    if (q) {
      qb.andWhere('(user.name ILIKE :query OR user.email ILIKE :query)', {
        query: `%${q}%`,
      })
    }
    
    return qb.getManyAndCount();
  }
}

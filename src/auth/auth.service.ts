import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt'
import { Role } from '../users/dicts/role.enum';
import { RegisterDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EntityName } from '../notifications/dicts/entity-name.enum';
import { EventType } from '../notifications/dicts/event-type.enum';
import { ActionType } from '../notifications/dicts/action-type.enum';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}
  
  async validateUser(email: string, pass: string): Promise<Omit<User, 'password'>> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, <string>user.password))) {
      const { password, ... result } = user;
      return result;
    }
    throw new UnauthorizedException('Invalid credentials')
  }
  
  async login(user: User) {
    const payload = { email: user.email, sub: user.id, role: user.role }
    
    this.eventEmitter.emit(`${EntityName.log}.${EventType.created}`, {
      userId: user.id,
      actionType: `${ActionType.login}.${EntityName.user}`,
      targetId: user.id,
      payload
    })
    
    return {
      access_token: this.jwtService.sign(payload),
      expires_in: this.configService.get<number>('JWT_EXPIRES_IN')
    };
  }
  
  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    
    const newUser = await this.usersService.create({
      email: registerDto.email,
      name: registerDto.name,
      password: hashedPassword,
      role: Role.user,
    });
    
    const { password, ...result } = newUser;
    
    this.eventEmitter.emit(`${EntityName.log}.${EventType.created}`, {
      userId: newUser.id,
      actionType: `${ActionType.register}.${EntityName.user}`,
      targetId: newUser.id,
      payloadAfter: newUser
    })
    
    return result;
  }
}

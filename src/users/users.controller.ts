import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UserQueryDto } from './dto/user-query.dto';
import { ResponsePaginationDto } from '../common/dto/response-pagination.dto';
import { AuthorDto } from './dto/author.dto';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  
  @Get('search')
  async searchUsers(
    @Query() queryDto: UserQueryDto,
    @Req() req,
  ): Promise<ResponsePaginationDto<AuthorDto>> {
    const { page = 1, limit = 20 } = queryDto;
    
    const [users, total] = await this.usersService.search(queryDto, req.user.id);
    
    const data = users.map(user => ({
      id: user.id,
      name: user.name,
    }));
    
    return {
      data,
      total,
      page,
      limit
    }
  }
}

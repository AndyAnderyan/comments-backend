import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { CommentsService } from '../comments.service';
import { Role } from '../../users/dicts/role.enum';

@Injectable()
export class CommentOwnerGuard implements CanActivate {
  constructor(private readonly commentsService: CommentsService) {}
  
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const commentId = request.params.id;
    
    if (!user || !commentId) {
      return false;
    }
    
    if (user.role === Role.Admin) {
      return true;
    }
    
    const comment = await this.commentsService.findCommentById(commentId);
    
    if (comment.author.id !== user.id) {
      throw new ForbiddenException('You do not have permission to perform this action.');
    }
    
    return true;
  }
}

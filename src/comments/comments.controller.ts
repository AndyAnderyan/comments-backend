import { CommentsService } from './comments.service';
import {
  Body, Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommentCreateDto } from './dto/comment-create.dto';
import { CommentQueryDto } from './dto/comment-query.dto';
import { Role } from '../users/dicts/role.enum';
import { CommentUpdateDto } from './dto/comment-update.dto';
import { CommentOwnerGuard } from './guards/comment-owner.guard';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(@Body() createCommentDto: CommentCreateDto, @Req() req) {
    const user = req.user;
    return this.commentsService.crete(createCommentDto, user);
  }

  @Get()
  findAll(@Query() query: CommentQueryDto, @Req() req) {
    if (req.user.role !== Role.admin) {
      query.isShowHidden = false;
    }
    return this.commentsService.findAll(query, req.user.id);
  }

  @Get('objects-list')
  findObjectsWithComments(@Query() query, @Req() req) {
    return this.commentsService.findObjectsWithComments(query, req.user);
  }

  @UseGuards(CommentOwnerGuard)
  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCommentDto: CommentUpdateDto,
    @Req() req,
  ) {
    return this.commentsService.update(id, updateCommentDto, req.user);
  }

  @Delete(':id')
  @UseGuards(CommentOwnerGuard)
  hideOrDelete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
    @Query('hardDelete') hardDelete?: boolean,
  ) {
    const user = req.user;
    if (hardDelete && user.role !== Role.admin) {
      throw new ForbiddenException('Only admin can hard delete comments.');
    }

    if (hardDelete) {
      return this.commentsService.hardDelete(id, user);
    }
    return this.commentsService.hide(id, user);
  }

  @Patch(':id/pin')
  @UseGuards(CommentOwnerGuard)
  pinComment(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    return this.commentsService.pin(id, req.user);
  }

  @Patch(':id/unpin')
  @UseGuards(CommentOwnerGuard)
  unpinComment(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    return this.commentsService.unpin(id, req.user);
  }

  @Post(':id/read')
  markAsRead(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    return this.commentsService.markAsRead(id, req.user.id);
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity'
import { CommentReadStatus } from './entities/comment-read-status.entity';
import { CommentNotification } from './entities/comment-notification.entity';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Comment,
      CommentReadStatus,
      CommentNotification
    ]),
    AuthModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService]
})
export class CommentsModule {}

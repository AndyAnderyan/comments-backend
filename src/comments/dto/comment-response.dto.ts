import { IsArray, IsBoolean, IsDate, IsInt, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { AuthorDto } from '../../users/dto/author.dto';
import { Type } from 'class-transformer';

export class CommentResponseDto {
  @IsUUID()
  id: string;
  
  @IsString()
  text: string;
  
  @ValidateNested()
  @Type(() => AuthorDto)
  author: AuthorDto;
  
  @IsUUID()
  authorId: string;
  
  @IsString()
  objectTypeId: string;
  
  @IsString()
  objectId: string;
  
  @IsDate()
  createdAt: Date;
  
  @IsDate()
  updatedAt: Date;
  
  @IsBoolean()
  isHidden: boolean;
  
  @IsBoolean()
  isPinned: boolean;
  
  @IsUUID()
  @IsOptional()
  parentId: string | null;
  
  @IsUUID()
  @IsOptional()
  rootCommentId: string | null;
  
  @IsInt()
  level: number;
  
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AuthorDto)
  recipients: AuthorDto[];
  
  @IsBoolean()
  isRead: boolean;
  
  @IsBoolean()
  isNotifiedToMeAndUnread: boolean;
  
  @IsInt()
  @IsOptional()
  repliesCount?: number;
}

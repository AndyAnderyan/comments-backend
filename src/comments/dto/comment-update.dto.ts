import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CommentUpdateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  text: string;

  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  notifyUserIds?: string[];
}

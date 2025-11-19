import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsUUID,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CommentCreateDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  objectTypeId?: string;
  
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  objectId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  text: string;

  @IsUUID()
  @IsOptional()
  parentId?: string | null;

  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  recipientsIds?: string[] = [];
}

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

  // Може бути null, якщо це тема або пряма відповідь на тему (згідно вашої логіки)
  @IsUUID()
  @IsOptional()
  parentId?: string | null;
  
  // Нове поле: явно вказує на тему
  @IsUUID()
  @IsOptional()
  rootCommentId?: string | null;

  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  recipientsIds?: string[] = [];
}

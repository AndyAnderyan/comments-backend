import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CommentQueryDto {
  @IsString()
  @IsOptional()
  objectTypeId?: string;

  @IsString()
  @IsOptional()
  objectId?: string;

  @IsUUID()
  @IsOptional()
  authorId?: string;

  @IsString()
  @IsOptional()
  searchText?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  topLevelOnly?: boolean = false;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isShowHidden?: boolean = false;

  @IsEnum(['createdAt', 'author'])
  @IsOptional()
  sortBy?: string = 'createdAt';

  @IsEnum(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}

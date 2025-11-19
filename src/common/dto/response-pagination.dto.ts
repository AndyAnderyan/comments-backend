import { IsArray, IsInt } from 'class-validator';

export class ResponsePaginationDto<T> {
  @IsArray()
  data: T[]
  
  @IsInt()
  total: number;
  
  @IsInt()
  page: number;
  
  @IsInt()
  limit: number;
}

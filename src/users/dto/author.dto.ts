import { IsString, IsUUID } from 'class-validator';

export class AuthorDto {
  @IsUUID()
  id: string;

  @IsString()
  name: string;
}

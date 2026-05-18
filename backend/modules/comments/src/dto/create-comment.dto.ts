import { IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  body!: string;

  @IsOptional()
  anchor?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  parentId?: string;
}

import { IsOptional, IsString } from 'class-validator';

export class QueryParamsDto {
  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  limit?: string;
}

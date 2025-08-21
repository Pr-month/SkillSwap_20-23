import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryParamsDto {
  @ApiPropertyOptional({
    description: 'Номер страницы',
    example: '1',
    default: '1',
  })
  @IsString()
  @IsOptional()
  page?: string;

  @ApiPropertyOptional({
    description: 'Лимит записей на странице',
    example: '20',
    default: '20',
  })
  @IsString()
  @IsOptional()
  limit?: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

/**
 * DTO для создания запроса обмена навыками
 * @description Содержит информацию о навыках, участвующих в обмене
 */
export class CreateRequestDto {
  @ApiProperty({
    description: 'Уникальный идентификатор предлагаемого навыка',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
    required: true
  })
  @IsUUID()
  offeredSkillId: string;

  @ApiProperty({
    description: 'Уникальный идентификатор запрашиваемого навыка',
    example: '456e789b-1234-5678-9abc-def012345678',
    format: 'uuid',
    required: true
  })
  @IsUUID()
  requestedSkillId: string;
}

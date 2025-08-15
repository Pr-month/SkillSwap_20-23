import { ReqStatus } from '../../common/requests-status.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

export class UpdateRequestDto {
  @ApiPropertyOptional({
    description: 'Новый статус запроса. Возможные значения:',
    enum: ReqStatus,
    enumName: 'ReqStatus',
    example: {
      PENDING: 'Ожидает обработки',
      ACCEPTED: 'Принят',
      REJECTED: 'Отклонён',
      INPROGRESS: 'В процессе',
      DONE: 'Завершён'
    },
    format: 'enum',
    default: null
  })
  @IsOptional()
  @IsEnum(ReqStatus)
  status?: ReqStatus;

  @ApiPropertyOptional({
    description: 'Флаг прочтения запроса',
    type: Boolean,
    example: false,
    default: null
  })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}

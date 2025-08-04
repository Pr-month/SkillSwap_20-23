import { IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { ReqStatus } from '../../common/requests-status.enum';

export class UpdateRequestDto {
  @IsOptional()
  @IsEnum(ReqStatus)
  status?: ReqStatus;

  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}

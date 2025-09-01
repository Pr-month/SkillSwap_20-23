import { ApiProperty } from '@nestjs/swagger';

export class returnErrorDTO {
  @ApiProperty({
    description: 'Сообщение об ошибке',
    example: 'Duplicate key error',
  })
  message: string;
}

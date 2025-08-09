import { ApiProperty } from '@nestjs/swagger';

export class returnErrorDTO {
  @ApiProperty({
    description: 'Сообщение об ошибке',
    example: 'Invalid credentials',
  })
  error: string;
}

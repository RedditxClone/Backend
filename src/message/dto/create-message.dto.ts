import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({
    description: 'message subject',
  })
  @Length(1, 300)
  subject: string;

  @ApiProperty({ description: 'message body', required: true })
  @Length(1, 10_000)
  body: string;
}

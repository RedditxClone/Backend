import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';

export class MessageReplyDto {
  @ApiProperty({ description: 'message body', required: true })
  @Length(1, 10_000)
  body: string;
}

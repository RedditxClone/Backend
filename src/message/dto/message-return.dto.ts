import { ApiProperty } from '@nestjs/swagger';

export class MessageReturnDto {
  @ApiProperty({ description: 'message text', required: true })
  text: string;
}

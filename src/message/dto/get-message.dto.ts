import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class GetMessagesDto {
  @Optional()
  @ApiProperty({
    description: 'if you want only common messages with user with user_id',
  })
  userId?: string;
}

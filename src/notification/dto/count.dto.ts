import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CountNotificationDto {
  @ApiProperty({ description: 'the count of new notifications' })
  @IsNumber()
  count: number;

  @ApiProperty({ description: 'the count of unread messages' })
  @IsNumber()
  messageCount: number;

  @ApiProperty({ description: 'the total count' })
  @IsNumber()
  total: number;
}

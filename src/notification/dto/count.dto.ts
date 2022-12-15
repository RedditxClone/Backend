import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CountNotificationDto {
  @ApiProperty({ description: 'the count of new notifications' })
  @IsNumber()
  count: number;
}

import { ApiProperty } from '@nestjs/swagger';

export class GetNotificationDto {
  @ApiProperty({ description: 'text of the notification' })
  text: string;
  @ApiProperty({ description: 'link that notification refers to' })
  href: string;
  @ApiProperty({ description: 'time of the notification' })
  time: Date;
}

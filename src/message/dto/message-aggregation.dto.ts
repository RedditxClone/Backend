import { ApiProperty } from '@nestjs/swagger';

import { MessageAggregationItemDto } from './message-aggregation-item.dto';

export class MessageAggregationDto {
  _id: string;

  @ApiProperty({ isArray: true, type: MessageAggregationItemDto })
  messages: MessageAggregationItemDto[];
}

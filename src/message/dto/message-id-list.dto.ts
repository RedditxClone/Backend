import { ApiProperty } from '@nestjs/swagger';
import type { Types } from 'mongoose';

export class MessageIdListDto {
  @ApiProperty({ type: String, isArray: true })
  messages: Types.ObjectId[];
}

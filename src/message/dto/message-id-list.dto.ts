import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';
import type { Types } from 'mongoose';

export class MessageIdListDto {
  @ApiProperty({ type: String, isArray: true })
  @IsMongoId({ each: true })
  messages: Types.ObjectId[];
}

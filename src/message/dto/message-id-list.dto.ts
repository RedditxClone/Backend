import type { Types } from 'mongoose';

export class MessageIdListDto {
  messages: Types.ObjectId[];
}

import { IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class BlockDto {
  @IsNotEmpty()
  blocker: Types.ObjectId;

  @IsNotEmpty()
  blocked: Types.ObjectId;
}

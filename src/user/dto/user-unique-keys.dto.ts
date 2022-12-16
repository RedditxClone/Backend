import { IsMongoId, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class UserUniqueKeys {
  @IsMongoId()
  _id: Types.ObjectId;

  @IsOptional()
  username?: string;
}

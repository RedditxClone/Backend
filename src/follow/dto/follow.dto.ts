import { IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class FollowDto {
  @IsNotEmpty()
  follower: Types.ObjectId;

  @IsNotEmpty()
  followed: Types.ObjectId;
}

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class FollowDto {
  @IsNotEmpty()
  follower: Types.ObjectId;

  @IsNotEmpty()
  followed: Types.ObjectId;

  @IsString()
  @IsOptional()
  followerUsername?: string;
}

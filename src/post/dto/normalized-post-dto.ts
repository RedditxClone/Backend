/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDate,
  IsMongoId,
  IsNumber,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';

class Subreddit {
  @ApiProperty()
  id: Types.ObjectId;

  @ApiProperty()
  name: string;

  @ApiProperty()
  type: string;
}
class User {
  @ApiProperty()
  id: Types.ObjectId;

  @ApiProperty()
  photo: string;

  @ApiProperty()
  username: string;
}
export class NormalizedPostDto {
  @ApiProperty()
  @IsMongoId()
  _id: Types.ObjectId;

  @ApiProperty()
  @IsString()
  text: string;

  @ApiProperty()
  @IsMongoId()
  userId: Types.ObjectId;

  @ApiProperty()
  @IsString()
  @IsArray()
  images: string[];

  @ApiProperty()
  @IsNumber()
  commentCount: number;

  @ApiProperty()
  @IsArray()
  title: string;

  @ApiProperty()
  @IsDate()
  publishedDate: Date;

  @ApiProperty()
  @IsMongoId()
  postId: Types.ObjectId;

  @ApiProperty()
  subreddit: Subreddit;

  @ApiProperty()
  user: User;

  @ApiProperty()
  @IsNumber()
  voteType: number;
}

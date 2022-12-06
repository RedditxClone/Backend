import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

import { SubredditDto } from './subreddit.dto';

export class FilterSubredditDto extends PartialType(SubredditDto) {
  @ApiProperty({ description: 'id of the subreddit' })
  @IsNotEmpty()
  @IsOptional()
  _id?: Types.ObjectId;
}

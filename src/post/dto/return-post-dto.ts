import { ApiProperty } from '@nestjs/swagger';
import type { Types } from 'mongoose';
import { GetUserInfoDto } from 'user/dto';
export class SubredditInfoDto {
  @ApiProperty({ description: 'subreddit name' })
  name: string;

  @ApiProperty({ description: 'subreddit id' })
  id: string;

  @ApiProperty({ description: 'is user join subreddit' })
  isJoin: boolean;

  @ApiProperty({ description: 'is user a moderator' })
  isModerator: boolean;
}
export class ReturnPostDto {
  @ApiProperty({ description: 'text of the post' })
  text: string;

  @ApiProperty({ description: 'id of the post' })
  _id: string;

  @ApiProperty({ description: 'post images' })
  images: string[];

  @ApiProperty({ description: 'number of the comments of the post' })
  commentCount: number;

  @ApiProperty({ description: 'title of the post' })
  title: string;

  @ApiProperty({ description: 'published date' })
  publishedDate: Date;

  @ApiProperty({ description: 'difference between upvotes and downvotes' })
  votesCount: number;

  @ApiProperty({
    description: 'some info about subreddit that the post contains to',
  })
  subredditInfo: SubredditInfoDto;

  @ApiProperty({
    description: 'some information about the user creating the post',
  })
  user: GetUserInfoDto;

  @ApiProperty({
    description: 'moderator spammed the post',
  })
  spammedBy: string;

  @ApiProperty({
    description: 'date spammed at',
  })
  spammedAt: Date;

  @ApiProperty({
    description: 'moderator approved the post',
  })
  approvedBy: string;

  @ApiProperty({
    description: 'date approved at',
  })
  approvedAt: Date;

  @ApiProperty({
    description: 'moderator removed the post',
  })
  removedBy: string;

  @ApiProperty({
    description: 'date removed at',
  })
  removedAt: Date;

  @ApiProperty({
    description:
      "type of vote that i created, null means that i haven't voted it",
  })
  voteType: string;

  @ApiProperty({ description: 'if the post visited by the current user' })
  isVisited: boolean;

  @ApiProperty({ description: 'if the post saved by the current user' })
  isSaved: boolean;
}

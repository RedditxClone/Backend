import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class ReturnPostDto {
  @ApiProperty({ description: 'text of the post' })
  text: string;

  @ApiProperty({ description: 'id of the post' })
  _id: Types.ObjectId;

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
  subreddit: {
    id: Types.ObjectId;
    name: string;
    type: string;
  };

  @ApiProperty({
    description: 'some information about the user creating the post',
  })
  user: {
    id: Types.ObjectId;
    photo: string;
    username: string;
  };

  @ApiProperty({
    description:
      "type of vote that i created, null means that i haven't voted it",
  })
  voteType: string | null;
}

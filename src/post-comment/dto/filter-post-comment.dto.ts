import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsMongoId, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class FilterPostCommentDto {
  @ApiProperty({
    description: `filter by post/comment id this will result in of 
    document with an array with one element with request id with all
     it's children in an array called comments.`,
  })
  @IsMongoId()
  @IsOptional()
  _id?: Types.ObjectId;

  @ApiProperty({
    description:
      'filter by subreddit id, This will get all posts with their comments in specific subreddit',
  })
  @IsMongoId()
  @IsOptional()
  subredditId?: Types.ObjectId;

  @ApiProperty({
    description:
      'filter by user id, This will get all posts with their comments belonging to specific user',
  })
  @IsMongoId()
  @IsOptional()
  userId?: Types.ObjectId;

  @ApiProperty({
    description: `only fetch top levels of posts or comments, Note it's optional`,
  })
  @IsString()
  @IsOptional()
  @IsIn(['Post', 'Comment'])
  type?: string;
}

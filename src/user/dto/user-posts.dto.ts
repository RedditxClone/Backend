import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class UserPosts {
  @ApiPropertyOptional({
    description: 'The post can not belong to a subreddit',
  })
  @ApiProperty({
    description: 'The id of subreddit the post belongs to',
  })
  subredditId: string;

  @ApiPropertyOptional({
    description: 'Posts can belong to a subreddit',
  })
  @ApiProperty({
    description: 'The name of subreddit the post belongs to',
  })
  subredditName?: string;

  @ApiProperty({ description: 'The id of the post' })
  postId: Date;

  @ApiProperty({ description: 'The date of the post' })
  postDate: Date;

  @ApiProperty({ description: 'The post content' })
  postTitle: string;

  @ApiProperty({ description: 'The Number of comments' })
  commentsNumber: number;

  @ApiProperty({ description: 'The Number of votes' })
  votesNumber: number;

  @ApiPropertyOptional()
  @ApiProperty({ description: 'The post media (images)' })
  media?: string[];
}

export class UserPostsDto {
  @ApiProperty()
  userOverview: UserPosts[];
}

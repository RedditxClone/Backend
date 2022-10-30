import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class UserOverview {
  @ApiProperty({ description: 'Either a comment or a post' })
  type: number;

  @ApiPropertyOptional({
    description: 'Both posts and comments can belong to a subreddit',
  })
  @ApiProperty({
    description: 'The id of subreddit the comment or the post belongs to',
  })
  subreddit_id?: string;
  @ApiPropertyOptional({
    description: 'Both posts and comments can belong to a subreddit',
  })
  @ApiProperty({
    description: 'The name of subreddit the comment or the post belongs to',
  })
  subreddit_name?: string;
  @ApiPropertyOptional({
    description: 'Both posts and comments can belong to a subreddit',
  })
  @ApiProperty({
    description: 'The icon of subreddit the comment or the post belongs to',
  })
  subreddit_icon?: string;

  @ApiProperty({ description: 'The post title (Both comments and posts have)' })
  postTitle: string;
  @ApiProperty({ description: 'The id of the post' })
  postId?: string;

  @ApiPropertyOptional({ description: `If it's a post` })
  @ApiProperty({ description: 'The date of the post' })
  postDate?: Date;
  @ApiPropertyOptional({ description: `If it's a post` })
  @ApiProperty({ description: 'The post content' })
  postContent?: string;
  @ApiPropertyOptional({ description: `If it's a post` })
  @ApiProperty({ description: 'The Number of comments' })
  postCommentsNumber?: number;
  @ApiPropertyOptional({ description: `If it's a post` })
  @ApiProperty({ description: 'The Number of votes' })
  postVotesNumber?: number;

  @ApiPropertyOptional({ description: `If it's a comment` })
  @ApiProperty({ description: 'The id of the comment' })
  commentId?: Date;
  @ApiPropertyOptional({ description: `If it's a comment` })
  @ApiProperty({ description: 'The date of the comment' })
  commentDate?: Date;
  @ApiPropertyOptional({ description: `If it's a comment` })
  @ApiProperty({ description: 'The comment content' })
  commentContent?: string;
  @ApiPropertyOptional({ description: `If it's a comment` })
  @ApiProperty({ description: 'The name of owner of the post' })
  postOwnerUserName?: string;
  @ApiPropertyOptional({ description: `If it's a comment` })
  @ApiProperty({
    description: '(comment number of upvotes) - (comment number of downvotes)',
  })
  pointsNumber?: number;
}

export class UserOverviewDto {
  @ApiProperty()
  userOverview: UserOverview[];
}

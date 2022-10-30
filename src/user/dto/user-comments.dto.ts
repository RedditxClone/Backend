import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class UserComments {
  @ApiPropertyOptional({
    description: 'Comments can belong to a subreddit',
  })
  @ApiProperty({
    description: 'The id of subreddit the comment or the post belongs to',
  })
  subreddit_id?: string;

  @ApiPropertyOptional({
    description: 'Comments can belong to a subreddit',
  })
  @ApiProperty({
    description: 'The name of subreddit the comment or the post belongs to',
  })
  subreddit_name?: string;

  @ApiPropertyOptional({
    description: 'Comments can belong to a subreddit',
  })
  @ApiProperty({
    description: 'The icon of subreddit the comment or the post belongs to',
  })
  subreddit_icon?: string;

  @ApiProperty({ description: 'The id of owner of the post' })
  postId: string;

  @ApiProperty({ description: 'The id of the comment' })
  commentId: Date;

  @ApiProperty({ description: 'The date of the comment' })
  commentDate: Date;

  @ApiProperty({ description: 'The comment content' })
  commentContent: string;

  @ApiProperty({ description: 'The name of owner of the post' })
  postOwnerUserName: string;

  @ApiProperty({
    description: 'Title of post content',
  })
  postTitle: string;

  @ApiProperty({
    description: '(comment number of upvotes) - (comment number of downvotes)',
  })
  pointsNumber: number;
}

export class UserCommentsDto {
  @ApiProperty()
  userComments: UserComments[];
}

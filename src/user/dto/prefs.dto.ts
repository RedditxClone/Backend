import { ApiProperty } from '@nestjs/swagger';

export class PrefsDto {
  @ApiProperty({ description: 'If the website is in darkmode' })
  nightmode: boolean;
  @ApiProperty({ description: 'If that type of posts suit that account' })
  over_18: boolean;
  @ApiProperty({ description: 'The default number of shown comments' })
  num_comments: number;
  @ApiProperty({
    description: 'Send an email when someone upvote any of our posts',
  })
  email_upvote_post: boolean;
  @ApiProperty({
    description: 'Send an email when someone upvote any of our comments',
  })
  email_upvote_comment: boolean;
  @ApiProperty({ description: 'Accept email messages' })
  email_messages: boolean;
  @ApiProperty({ description: 'Default comments sorting criteria' })
  default_comment_sort: number;
  @ApiProperty({ description: 'Show flairs or not' })
  show_flair: boolean;
}

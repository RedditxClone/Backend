import { ApiProperty } from '@nestjs/swagger';

export class DiscoverReturnDto {
  @ApiProperty({ description: 'id of the post' })
  postId: string;

  @ApiProperty({ description: 'id and name of the subreddit' })
  subredditInfo: any;

  @ApiProperty({ description: 'image link' })
  image: string;
}

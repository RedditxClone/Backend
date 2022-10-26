import { ApiProperty } from '@nestjs/swagger';

export class SubredditSearchDto {
  @ApiProperty({
    description: 'text te search about inside posts',
    required: true,
  })
  text: string;
}

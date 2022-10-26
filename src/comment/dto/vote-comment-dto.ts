import { ApiProperty } from '@nestjs/swagger';

export class VoteCommentDto {
  @ApiProperty()
  dir: number;
}

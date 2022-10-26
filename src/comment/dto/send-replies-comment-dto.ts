import { ApiProperty } from '@nestjs/swagger';

export class SendRepliesCommentDto {
  @ApiProperty()
  state: boolean;
}

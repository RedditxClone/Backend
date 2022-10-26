import { ApiProperty } from '@nestjs/swagger';

export class SpamCommentDto {
  @ApiProperty()
  message: string;
}

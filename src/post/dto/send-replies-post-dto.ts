import { ApiProperty } from '@nestjs/swagger';

export class SendRepliesPostDto {
  @ApiProperty()
  state: boolean;
}

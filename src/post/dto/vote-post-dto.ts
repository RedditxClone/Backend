import { ApiProperty } from '@nestjs/swagger';

export class VotePostDto {
  @ApiProperty()
  dir: number;
}

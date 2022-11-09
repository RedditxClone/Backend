import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty()
  parentId: string;

  @ApiProperty()
  parentType: string; // post or comment

  @ApiProperty()
  text: string;
}

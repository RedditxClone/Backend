import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommentDto {
  @ApiProperty()
  parentId: string;
  @ApiProperty()
  text: string;
}

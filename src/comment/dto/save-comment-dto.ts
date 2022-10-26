import { ApiProperty } from '@nestjs/swagger';

export class SaveCommentDto {
  @ApiProperty()
  category: string;
}
